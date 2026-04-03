import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../auth/token_storage.dart';
import '../errors/failures.dart';
import 'api_endpoints.dart';

class ApiClient {
  late final Dio _dio;
  final TokenStorage _tokenStorage;

  // Base URL injected via dart-define at build time; fallback to localhost
  static const String _baseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:8000');

  ApiClient(this._tokenStorage) {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.addAll([
      _AuthInterceptor(_dio, _tokenStorage),
      if (kDebugMode) _LoggingInterceptor(),
      _ErrorInterceptor(),
    ]);
  }

  Dio get dio => _dio;
}

// ---------------------------------------------------------------------------
// Auth Interceptor — attaches Bearer token and handles 401 refresh
// ---------------------------------------------------------------------------
class _AuthInterceptor extends Interceptor {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  bool _isRefreshing = false;
  final List<RequestOptions> _pendingRequests = [];

  _AuthInterceptor(this._dio, this._tokenStorage);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    // Avoid infinite loop if refresh itself 401s
    if (err.requestOptions.path == ApiEndpoints.refresh) {
      handler.next(err);
      return;
    }

    if (_isRefreshing) {
      _pendingRequests.add(err.requestOptions);
      return;
    }

    _isRefreshing = true;
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null) throw Exception('No refresh token');

      final response = await _dio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
        options: Options(headers: {'Authorization': null}),
      );

      final newAccess = response.data['accessToken'] as String;
      final newRefresh = response.data['refreshToken'] as String;
      await _tokenStorage.saveTokens(
        accessToken: newAccess,
        refreshToken: newRefresh,
      );

      // Retry all queued requests
      for (final req in _pendingRequests) {
        req.headers['Authorization'] = 'Bearer $newAccess';
        _dio.fetch(req);
      }
      _pendingRequests.clear();

      // Retry the original failed request
      err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
      final retried = await _dio.fetch(err.requestOptions);
      handler.resolve(retried);
    } catch (_) {
      await _tokenStorage.clearAll();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Logging Interceptor — debug builds only
// ---------------------------------------------------------------------------
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('[API] --> ${options.method} ${options.path}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('[API] <-- ${response.statusCode} ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('[API] ERR ${err.response?.statusCode} ${err.requestOptions.path}: ${err.message}');
    handler.next(err);
  }
}

// ---------------------------------------------------------------------------
// Error Interceptor — maps HTTP errors to typed Failures
// ---------------------------------------------------------------------------
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    Failure failure;
    final status = err.response?.statusCode;

    if (err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.unknown) {
      failure = const NetworkFailure();
    } else {
      switch (status) {
        case 400:
          final data = err.response?.data;
          final msg = data is Map ? (data['message'] ?? 'Validation error') : 'Bad request';
          failure = ValidationFailure(msg.toString());
        case 401:
          failure = const UnauthorisedFailure();
        case 403:
          failure = const ForbiddenFailure();
        case 404:
          failure = const NotFoundFailure();
        default:
          failure = ServerFailure(
            err.response?.data?['message']?.toString() ?? 'Server error',
            statusCode: status,
          );
      }
    }

    handler.next(DioException(
      requestOptions: err.requestOptions,
      response: err.response,
      type: err.type,
      error: failure,
      message: failure.message,
    ));
  }
}
