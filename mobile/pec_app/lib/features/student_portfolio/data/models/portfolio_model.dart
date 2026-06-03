class PortfolioProject {
  final String id;
  final String title;
  final String? description;
  final List<String> techStack;
  final String? imageUrl;
  final String? repoUrl;
  final String? demoUrl;
  final DateTime createdAt;

  const PortfolioProject({
    required this.id,
    required this.title,
    this.description,
    this.techStack = const [],
    this.imageUrl,
    this.repoUrl,
    this.demoUrl,
    required this.createdAt,
  });

  factory PortfolioProject.fromJson(Map<String, dynamic> j) => PortfolioProject(
        id: j['id'] as String,
        title: j['title'] as String,
        description: j['description'] as String?,
        techStack: (j['techStack'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        imageUrl: j['imageUrl'] as String?,
        repoUrl: j['repoUrl'] as String? ?? j['githubUrl'] as String?,
        demoUrl: j['demoUrl'] as String? ?? j['liveUrl'] as String?,
        createdAt:
            DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
      );
}
