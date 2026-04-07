class FAQ {
  final String id;
  final String category;
  final String question;
  final String answer;
  final bool isExpanded;

  const FAQ({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
    this.isExpanded = false,
  });

  FAQ copyWith({
    String? id,
    String? category,
    String? question,
    String? answer,
    bool? isExpanded,
  }) {
    return FAQ(
      id: id ?? this.id,
      category: category ?? this.category,
      question: question ?? this.question,
      answer: answer ?? this.answer,
      isExpanded: isExpanded ?? this.isExpanded,
    );
  }
}

class SupportCategory {
  final String id;
  final String name;
  final String icon;
  final List<FAQ> faqs;

  const SupportCategory({
    required this.id,
    required this.name,
    required this.icon,
    required this.faqs,
  });
}

class ContactInfo {
  final String type; // email, phone, website
  final String label;
  final String value;
  final String? description;

  const ContactInfo({
    required this.type,
    required this.label,
    required this.value,
    this.description,
  });
}

// Mock data for help and support
final List<SupportCategory> mockSupportCategories = [
  SupportCategory(
    id: 'academics',
    name: 'Academics',
    icon: 'school',
    faqs: [
      FAQ(
        id: '1',
        category: 'Academics',
        question: 'How do I view my course materials?',
        answer:
            'You can access course materials from the Course Materials section in the main menu. Select your course and browse through available materials including lecture slides, notes, and assignments.',
      ),
      FAQ(
        id: '2',
        category: 'Academics',
        question: 'How is my GPA calculated?',
        answer:
            'Your GPA is calculated based on the grades you receive in each course, weighted by the course credits. You can view your current GPA on the Score Sheet page in your profile.',
      ),
      FAQ(
        id: '3',
        category: 'Academics',
        question: 'How do I enroll in a course?',
        answer:
            'Course enrollment is typically done during the registration period at the beginning of each semester. Contact your department coordinator or visit the Academics office for enrollment assistance.',
      ),
      FAQ(
        id: '4',
        category: 'Academics',
        question: 'Where can I find exam schedules?',
        answer:
            'Exam schedules are available in the Examinations section. You can also view the Academic Calendar for important dates and deadlines.',
      ),
    ],
  ),
  SupportCategory(
    id: 'attendance',
    name: 'Attendance',
    icon: 'fact_check',
    faqs: [
      FAQ(
        id: '5',
        category: 'Attendance',
        question: 'How do I track my attendance?',
        answer:
            'Your attendance records are available in the Attendance section. You can view attendance by course and get a detailed breakdown of present, absent, and leave days.',
      ),
      FAQ(
        id: '6',
        category: 'Attendance',
        question: 'What is the minimum attendance requirement?',
        answer:
            'The minimum attendance requirement is typically 75% per course. Check the current academic policy or contact your department for specific requirements.',
      ),
      FAQ(
        id: '7',
        category: 'Attendance',
        question: 'What happens if I fall below minimum attendance?',
        answer:
            'If you fall below the minimum attendance, you may be barred from exams or face academic consequences. Contact your faculty advisor immediately to discuss solutions.',
      ),
      FAQ(
        id: '8',
        category: 'Attendance',
        question: 'How do I apply for leave?',
        answer:
            'Leave applications can be submitted through the student portal or by visiting the Academics office. You\'ll need to provide proper documentation and reasons for your leave.',
      ),
    ],
  ),
  SupportCategory(
    id: 'hostel',
    name: 'Hostel & Campus',
    icon: 'apartment',
    faqs: [
      FAQ(
        id: '9',
        category: 'Hostel & Campus',
        question: 'How do I report hostel maintenance issues?',
        answer:
            'You can report hostel issues through the Hostel Issues section in the app. Select the issue type, describe the problem, attach photos if needed, and submit. The maintenance team will respond within 24-48 hours.',
      ),
      FAQ(
        id: '10',
        category: 'Hostel & Campus',
        question: 'What is the hostel check-in/check-out procedure?',
        answer:
            'Check-in typically happens at the beginning of the semester. You\'ll receive an email with check-in details. For check-out, inform the hostel warden and ensure your room is in good condition.',
      ),
      FAQ(
        id: '11',
        category: 'Hostel & Campus',
        question: 'Where are hostel facilities located?',
        answer:
            'Use the Campus Map to locate hostel buildings, dining facilities, and other important locations on campus. The map is interactive and shows walking times between locations.',
      ),
      FAQ(
        id: '12',
        category: 'Hostel & Campus',
        question: 'How do I access the Night Canteen?',
        answer:
            'The Night Canteen operates from 6 PM to 11 PM. Use the Night Canteen app section to browse the menu, place orders, and track delivery to your hostel room.',
      ),
    ],
  ),
  SupportCategory(
    id: 'finance',
    name: 'Finance & Fees',
    icon: 'account_balance_wallet',
    faqs: [
      FAQ(
        id: '13',
        category: 'Finance & Fees',
        question: 'Where can I view my fee structure?',
        answer:
            'Your fee structure and payments are available in the Finance section. You can view semester fees, hostel charges, and other applicable fees.',
      ),
      FAQ(
        id: '14',
        category: 'Finance & Fees',
        question: 'How do I pay my fees?',
        answer:
            'Fees can be paid through the Finance section using online payment methods. You\'ll receive payment receipts which you can download for your records.',
      ),
      FAQ(
        id: '15',
        category: 'Finance & Fees',
        question: 'What is the fee refund policy?',
        answer:
            'Refund policies vary by type of fee. Contact the Finance office for specific information about your applicable refund policy.',
      ),
    ],
  ),
  SupportCategory(
    id: 'technical',
    name: 'Technical Support',
    icon: 'computer',
    faqs: [
      FAQ(
        id: '16',
        category: 'Technical Support',
        question: 'How do I reset my password?',
        answer:
            'On the login screen, tap "Forgot Password" and enter your email. You\'ll receive a password reset link within minutes. Follow the link to set a new password.',
      ),
      FAQ(
        id: '17',
        category: 'Technical Support',
        question: 'Why can\'t I access my account?',
        answer:
            'If you can\'t access your account, try: 1) Resetting your password, 2) Clearing app cache, 3) Reinstalling the app. If issues persist, contact technical support.',
      ),
      FAQ(
        id: '18',
        category: 'Technical Support',
        question: 'The app keeps crashing. What should I do?',
        answer:
            'Try: 1) Restarting your phone, 2) Updating to the latest app version, 3) Clearing cache, 4) Reinstalling the app. Contact support if the issue continues.',
      ),
      FAQ(
        id: '19',
        category: 'Technical Support',
        question: 'I\'m experiencing slow performance. How can I improve it?',
        answer:
            'Clear app cache regularly, close unnecessary apps, ensure good internet connection, and update to the latest app version. Contact support for persistent issues.',
      ),
    ],
  ),
];

final List<ContactInfo> mockContactInfo = [
  ContactInfo(
    type: 'email',
    label: 'General Support',
    value: 'support@pec.edu.in',
    description: 'For general inquiries and support',
  ),
  ContactInfo(
    type: 'email',
    label: 'Academic Support',
    value: 'academics@pec.edu.in',
    description: 'For academic-related issues',
  ),
  ContactInfo(
    type: 'phone',
    label: 'Helpdesk',
    value: '+91-XXXX-XXXX-XXX',
    description: 'Available 9 AM - 5 PM (Monday to Friday)',
  ),
  ContactInfo(
    type: 'phone',
    label: 'Hostel Support',
    value: '+91-XXXX-XXXX-XXX',
    description: 'For hostel-related emergencies',
  ),
];
