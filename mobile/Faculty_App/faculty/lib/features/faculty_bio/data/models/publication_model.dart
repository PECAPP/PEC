class PublicationModel {
  final String id;
  final String facultyId;
  final String title;
  final String? journal;
  final String? conference;
  final int year;
  final String? doi;
  final String? url;
  final String? abstract_;
  final int citations;
  final String? coAuthors;

  const PublicationModel({
    required this.id,
    required this.facultyId,
    required this.title,
    this.journal,
    this.conference,
    required this.year,
    this.doi,
    this.url,
    this.abstract_,
    this.citations = 0,
    this.coAuthors,
  });

  factory PublicationModel.fromJson(Map<String, dynamic> j) => PublicationModel(
    id: (j['id'] ?? '').toString(),
    facultyId: (j['facultyId'] ?? '').toString(),
    title: j['title'] as String? ?? '',
    journal: j['journal'] as String?,
    conference: j['conference'] as String?,
    year: j['year'] as int? ?? DateTime.now().year,
    doi: j['doi'] as String?,
    url: j['url'] as String?,
    abstract_: j['abstract'] as String?,
    citations: j['citations'] as int? ?? 0,
    coAuthors: j['coAuthors'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'title': title,
    'journal': journal,
    'conference': conference,
    'year': year,
    'doi': doi,
    'url': url,
    'abstract': abstract_,
    'citations': citations,
    'coAuthors': coAuthors,
  };
}

class AwardModel {
  final String id;
  final String title;
  final String? description;
  final String? awardedBy;
  final int year;
  final String category;

  const AwardModel({
    required this.id,
    required this.title,
    this.description,
    this.awardedBy,
    required this.year,
    this.category = 'academic',
  });

  factory AwardModel.fromJson(Map<String, dynamic> j) => AwardModel(
    id: (j['id'] ?? '').toString(),
    title: j['title'] as String? ?? '',
    description: j['description'] as String?,
    awardedBy: j['awardedBy'] as String?,
    year: j['year'] as int? ?? DateTime.now().year,
    category: j['category'] as String? ?? 'academic',
  );

  Map<String, dynamic> toJson() => {
    'title': title,
    'description': description,
    'awardedBy': awardedBy,
    'year': year,
    'category': category,
  };
}

class ConferenceModel {
  final String id;
  final String name;
  final String? location;
  final String? startDate;
  final String? endDate;
  final String? role;
  final String? presentationTitle;
  final String? description;

  const ConferenceModel({
    required this.id,
    required this.name,
    this.location,
    this.startDate,
    this.endDate,
    this.role,
    this.presentationTitle,
    this.description,
  });

  factory ConferenceModel.fromJson(Map<String, dynamic> j) => ConferenceModel(
    id: (j['id'] ?? '').toString(),
    name: j['name'] as String? ?? '',
    location: j['location'] as String?,
    startDate: j['startDate'] as String?,
    endDate: j['endDate'] as String?,
    role: j['role'] as String?,
    presentationTitle: j['presentationTitle'] as String?,
    description: j['description'] as String?,
  );
}

class ConsultationModel {
  final String id;
  final String organization;
  final String? description;
  final String? startDate;
  final String? endDate;
  final String status;

  const ConsultationModel({
    required this.id,
    required this.organization,
    this.description,
    this.startDate,
    this.endDate,
    this.status = 'active',
  });

  factory ConsultationModel.fromJson(Map<String, dynamic> j) => ConsultationModel(
    id: (j['id'] ?? '').toString(),
    organization: j['organization'] as String? ?? '',
    description: j['description'] as String?,
    startDate: j['startDate'] as String?,
    endDate: j['endDate'] as String?,
    status: j['status'] as String? ?? 'active',
  );
}
