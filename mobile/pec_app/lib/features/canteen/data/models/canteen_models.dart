import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class CanteenItem {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String category; // breakfast | lunch | snacks | beverages | dinner
  final bool isAvailable;
  final String? imageUrl;
  final bool isVeg;

  const CanteenItem({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.category,
    required this.isAvailable,
    this.imageUrl,
    this.isVeg = true,
  });

  static String _asString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    if (value is String) return value;
    return value.toString();
  }

  static double _asDouble(dynamic value, {double fallback = 0}) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static bool _asBool(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    final text = value?.toString().toLowerCase();
    if (text == 'true' || text == 'yes' || text == '1') return true;
    if (text == 'false' || text == 'no' || text == '0') return false;
    return fallback;
  }

  factory CanteenItem.fromJson(Map<String, dynamic> j) => CanteenItem(
        id: _asString(j['id'] ?? j['_id']),
        name: _asString(j['name'], fallback: 'Item'),
        description: j['description']?.toString(),
        price: _asDouble(j['price']),
        category: _asString(j['category'], fallback: 'snacks'),
        isAvailable: _asBool(j['isAvailable'], fallback: true),
        imageUrl: j['imageUrl']?.toString(),
        isVeg: _asBool(j['isVeg'], fallback: true),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'category': category,
        'isAvailable': isAvailable,
        'imageUrl': imageUrl,
        'isVeg': isVeg,
      };

  Color get categoryColor {
    switch (category) {
      case 'breakfast':
        return AppColors.warning;
      case 'lunch':
        return AppColors.blue;
      case 'snacks':
        return AppColors.yellow;
      case 'beverages':
        return AppColors.green;
      case 'dinner':
        return AppColors.red;
      default:
        return AppColors.textSecondary;
    }
  }
}

class CartItem {
  final CanteenItem item;
  final int qty;
  const CartItem({required this.item, required this.qty});
  CartItem copyWith({int? qty}) => CartItem(item: item, qty: qty ?? this.qty);
  double get subtotal => item.price * qty;
}

class CanteenOrder {
  final String id;
  final String tokenNumber;
  final List<CanteenOrderLine> lines;
  final double totalAmount;
  final String status; // pending | preparing | ready | delivered | cancelled
  final DateTime createdAt;

  const CanteenOrder({
    required this.id,
    required this.tokenNumber,
    required this.lines,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
  });

  static String _asString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    if (value is String) return value;
    return value.toString();
  }

  static double _asDouble(dynamic value, {double fallback = 0}) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static List<dynamic> _extractItems(dynamic raw) {
    if (raw is List) return raw;
    if (raw is Map<String, dynamic>) {
      final data = raw['data'];
      if (data is List) return data;
      final items = raw['items'];
      if (items is List) return items;
      final results = raw['results'];
      if (results is List) return results;
    }
    return const [];
  }

  factory CanteenOrder.fromJson(Map<String, dynamic> j) {
    final items = _extractItems(j)
        .whereType<Map<String, dynamic>>()
        .map(CanteenOrderLine.fromJson)
        .toList();
    return CanteenOrder(
      id: _asString(j['id'] ?? j['_id']),
      tokenNumber: _asString(j['tokenNumber'] ?? j['token'], fallback: '#--'),
      lines: items,
      totalAmount: _asDouble(j['totalAmount']),
      status: _asString(j['status'], fallback: 'pending'),
      createdAt: DateTime.tryParse(_asString(j['createdAt'])) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tokenNumber': tokenNumber,
        'items': lines.map((e) => e.toJson()).toList(),
        'totalAmount': totalAmount,
        'status': status,
        'createdAt': createdAt.toIso8601String(),
      };

  Color get statusColor {
    switch (status) {
      case 'preparing':
        return AppColors.warning;
      case 'ready':
        return AppColors.green;
      case 'delivered':
        return AppColors.blue;
      case 'cancelled':
        return AppColors.red;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData get statusIcon {
    switch (status) {
      case 'preparing':
        return Icons.restaurant_outlined;
      case 'ready':
        return Icons.check_circle_outline;
      case 'delivered':
        return Icons.done_all;
      case 'cancelled':
        return Icons.cancel_outlined;
      default:
        return Icons.hourglass_empty_outlined;
    }
  }
}

class CanteenOrderLine {
  final String name;
  final int qty;
  final double price;
  const CanteenOrderLine(
      {required this.name, required this.qty, required this.price});
  factory CanteenOrderLine.fromJson(Map<String, dynamic> j) => CanteenOrderLine(
        name: (j['name'] ?? j['itemName'] ?? 'Item').toString(),
        qty: (j['qty'] as num?)?.toInt() ??
            (j['quantity'] as num?)?.toInt() ??
            1,
        price: (j['price'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'qty': qty,
        'price': price,
      };
}
