import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../auth/token_storage.dart';
import '../errors/failures.dart';
import 'api_endpoints.dart';

class ApiClient {
  late final Dio _dio;
  final TokenStorage _tokenStorage;

  static const String _configuredBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static String _normalizeBaseUrl(String raw) {
    var url = raw.trim();
    if (url.isEmpty) return url;

    // Append /api suffix if not already present.
    if (!url.endsWith('/api')) {
      url = '${url.replaceAll(RegExp(r'/$'), '')}/api';
    }

    return url;
  }

  static String _resolveBaseUrl() {
    if (_configuredBaseUrl.trim().isNotEmpty) {
      return _normalizeBaseUrl(_configuredBaseUrl);
    }

    // Support runtime .env when app is launched without --dart-define.
    final envBaseUrl = dotenv.maybeGet('API_BASE_URL')?.trim() ?? '';
    if (envBaseUrl.isNotEmpty) return _normalizeBaseUrl(envBaseUrl);

    // Fallback — set API_BASE_URL in .env for real device usage.
    return 'http://10.0.2.2:4000/api';
  }

  ApiClient(this._tokenStorage) {
    _dio = Dio(BaseOptions(
      baseUrl: _resolveBaseUrl(),
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 45),
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

class _AuthInterceptor extends Interceptor {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  bool _isRefreshing = false;
  final List<RequestOptions> _pendingRequests = [];

  _AuthInterceptor(this._dio, this._tokenStorage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
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

      final newAccess = response.data['access_token'] as String;
      final newRefresh = (response.data['refresh_token'] as String?) ?? refreshToken;
      await _tokenStorage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);

      for (final req in _pendingRequests) {
        req.headers['Authorization'] = 'Bearer $newAccess';
        _dio.fetch(req);
      }
      _pendingRequests.clear();

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
    debugPrint('[API] ERR ${err.response?.statusCode} ${err.requestOptions.path}');
    handler.next(err);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    Failure failure;
    final status = err.response?.statusCode;

    if (err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout ||
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
