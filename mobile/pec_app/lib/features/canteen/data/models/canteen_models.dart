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

  factory CanteenItem.fromJson(Map<String, dynamic> j) => CanteenItem(
        id: j['id'] as String,
        name: j['name'] as String,
        description: j['description'] as String?,
        price: (j['price'] as num).toDouble(),
        category: j['category'] as String? ?? 'snacks',
        isAvailable: j['isAvailable'] as bool? ?? true,
        imageUrl: j['imageUrl'] as String?,
        isVeg: j['isVeg'] as bool? ?? true,
      );

  Color get categoryColor {
    switch (category) {
      case 'breakfast': return AppColors.warning;
      case 'lunch': return AppColors.blue;
      case 'snacks': return AppColors.yellow;
      case 'beverages': return AppColors.green;
      case 'dinner': return AppColors.red;
      default: return AppColors.textSecondary;
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

  factory CanteenOrder.fromJson(Map<String, dynamic> j) {
    final items = (j['items'] as List<dynamic>? ?? [])
        .map((e) => CanteenOrderLine.fromJson(e as Map<String, dynamic>))
        .toList();
    return CanteenOrder(
      id: j['id'] as String,
      tokenNumber: j['tokenNumber'] as String? ?? j['token'] as String? ?? '#--',
      lines: items,
      totalAmount: (j['totalAmount'] as num?)?.toDouble() ?? 0,
      status: j['status'] as String? ?? 'pending',
      createdAt: DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Color get statusColor {
    switch (status) {
      case 'preparing': return AppColors.warning;
      case 'ready': return AppColors.green;
      case 'delivered': return AppColors.blue;
      case 'cancelled': return AppColors.red;
      default: return AppColors.textSecondary;
    }
  }

  IconData get statusIcon {
    switch (status) {
      case 'preparing': return Icons.restaurant_outlined;
      case 'ready': return Icons.check_circle_outline;
      case 'delivered': return Icons.done_all;
      case 'cancelled': return Icons.cancel_outlined;
      default: return Icons.hourglass_empty_outlined;
    }
  }
}

class CanteenOrderLine {
  final String name;
  final int qty;
  final double price;
  const CanteenOrderLine({required this.name, required this.qty, required this.price});
  factory CanteenOrderLine.fromJson(Map<String, dynamic> j) => CanteenOrderLine(
        name: j['name'] as String? ?? j['itemName'] as String? ?? 'Item',
        qty: (j['qty'] as num?)?.toInt() ?? (j['quantity'] as num?)?.toInt() ?? 1,
        price: (j['price'] as num?)?.toDouble() ?? 0,
      );
}
