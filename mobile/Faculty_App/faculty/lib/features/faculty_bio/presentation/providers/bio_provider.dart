import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/bio_remote_datasource.dart';
import '../../data/models/publication_model.dart';

final bioDataSourceProvider = Provider((ref) {
  return BioRemoteDataSource(ref.read(apiClientProvider));
});

// ── Bio State ──
class BioState {
  final bool loading;
  final List<PublicationModel> publications;
  final List<AwardModel> awards;
  final List<ConferenceModel> conferences;
  final List<ConsultationModel> consultations;
  final String? error;

  const BioState({
    this.loading = true,
    this.publications = const [],
    this.awards = const [],
    this.conferences = const [],
    this.consultations = const [],
    this.error,
  });

  BioState copyWith({
    bool? loading,
    List<PublicationModel>? publications,
    List<AwardModel>? awards,
    List<ConferenceModel>? conferences,
    List<ConsultationModel>? consultations,
    String? error,
  }) => BioState(
    loading: loading ?? this.loading,
    publications: publications ?? this.publications,
    awards: awards ?? this.awards,
    conferences: conferences ?? this.conferences,
    consultations: consultations ?? this.consultations,
    error: error,
  );

  int get totalPublications => publications.length;
  int get totalAwards => awards.length;
  int get totalConferences => conferences.length;
  int get totalConsultations => consultations.length;
  int get totalCitations => publications.fold(0, (s, p) => s + p.citations);
}

class BioNotifier extends StateNotifier<BioState> {
  final BioRemoteDataSource _ds;
  final String _facultyId;

  BioNotifier(this._ds, this._facultyId) : super(const BioState()) {
    load();
  }

  Future<void> load() async {
    if (_facultyId.isEmpty) {
      state = state.copyWith(loading: false);
      return;
    }
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await _ds.getFacultyBio(_facultyId);
      state = BioState(
        loading: false,
        publications: _parseList(data['publications'], PublicationModel.fromJson),
        awards: _parseList(data['awards'], AwardModel.fromJson),
        conferences: _parseList(data['conferences'], ConferenceModel.fromJson),
        consultations: _parseList(data['consultations'], ConsultationModel.fromJson),
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  List<T> _parseList<T>(dynamic raw, T Function(Map<String, dynamic>) fromJson) {
    if (raw is! List) return [];
    return raw.map((e) => fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> addPublication(Map<String, dynamic> body) async {
    await _ds.createPublication(body);
    await load();
  }

  Future<void> deletePublication(String id) async {
    await _ds.deletePublication(id);
    state = state.copyWith(
      publications: state.publications.where((p) => p.id != id).toList(),
    );
  }

  Future<void> addAward(Map<String, dynamic> body) async {
    await _ds.createAward(body);
    await load();
  }

  Future<void> deleteAward(String id) async {
    await _ds.deleteAward(id);
    state = state.copyWith(awards: state.awards.where((a) => a.id != id).toList());
  }

  Future<void> addConference(Map<String, dynamic> body) async {
    await _ds.createConference(body);
    await load();
  }

  Future<void> updateConference(String id, Map<String, dynamic> body) async {
    await _ds.updateConference(id, body);
    await load();
  }

  Future<void> deleteConference(String id) async {
    await _ds.deleteConference(id);
    state = state.copyWith(conferences: state.conferences.where((c) => c.id != id).toList());
  }

  Future<void> addConsultation(Map<String, dynamic> body) async {
    await _ds.createConsultation(body);
    await load();
  }

  Future<void> updateConsultation(String id, Map<String, dynamic> body) async {
    await _ds.updateConsultation(id, body);
    await load();
  }

  Future<void> deleteConsultation(String id) async {
    await _ds.deleteConsultation(id);
    state = state.copyWith(
      consultations: state.consultations.where((c) => c.id != id).toList(),
    );
  }
}

final bioProvider = StateNotifierProvider<BioNotifier, BioState>((ref) {
  final auth = ref.watch(authNotifierProvider);
  return BioNotifier(ref.read(bioDataSourceProvider), auth.user?.uid ?? '');
});
