
import 'package:flutter/material.dart';

class PaymentScreen extends StatelessWidget {
  final String paymentId;
  
  const PaymentScreen({super.key, required this.paymentId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Payment - $paymentId'),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.payment,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Payment feature coming soon!',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Payment ID: $paymentId',
              style: TextStyle(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
