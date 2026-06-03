import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/help_support_models.dart';

// Provider for support categories
final supportCategoriesProvider = Provider<List<SupportCategory>>((ref) {
  return mockSupportCategories;
});

// Provider for selected category
final selectedSupportCategoryProvider =
    StateProvider<String>((ref) => 'academics');

// Provider for expanded FAQs
final expandedFAQsProvider = StateProvider<Set<String>>((ref) => {});

// Provider for search query
final supportSearchProvider = StateProvider<String>((ref) => '');

// Provider for filtered FAQs
final filteredFAQsProvider = Provider<List<FAQ>>((ref) {
  final categories = ref.watch(supportCategoriesProvider);
  final selectedCategory = ref.watch(selectedSupportCategoryProvider);
  final searchQuery = ref.watch(supportSearchProvider);

  final category = categories.firstWhere(
    (cat) => cat.id == selectedCategory,
    orElse: () => categories.first,
  );

  if (searchQuery.isEmpty) {
    return category.faqs;
  }

  return category.faqs
      .where((faq) =>
          faq.question.toLowerCase().contains(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().contains(searchQuery.toLowerCase()))
      .toList();
});

// Provider for contact info
final contactInfoProvider = Provider<List<ContactInfo>>((ref) {
  return mockContactInfo;
});
