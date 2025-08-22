
import 'package:flutter/material.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E3A8A),
      body: SafeArea(
        child: Column(
          children: [
            // Header with status bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 40), // Spacer for balance
                  const Text(
                    '5:41',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                  Row(
                    children: [
                      const Icon(Icons.signal_cellular_4_bar, color: Colors.white, size: 16),
                      const SizedBox(width: 4),
                      const Icon(Icons.battery_full, color: Colors.white, size: 16),
                    ],
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const SizedBox(height: 40),
                      
                      // App logo/mascot
                      Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E3A8A),
                          borderRadius: BorderRadius.circular(75),
                        ),
                        child: const Icon(
                          Icons.work,
                          color: Colors.white,
                          size: 80,
                        ),
                      ),
                      
                      const SizedBox(height: 40),
                      
                      // Welcome text
                      const Text(
                        'Welcome to Currijobs',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      const Text(
                        'Find local jobs and earn money doing what you love',
                        style: TextStyle(
                          fontSize: 18,
                          color: Color(0xFF6B7280),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      const SizedBox(height: 60),
                      
                      // Get Started button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pushNamed('/login');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E3A8A),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Get Started',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Sign Up button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).pushNamed('/register');
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1E3A8A),
                            side: const BorderSide(color: Color(0xFF1E3A8A)),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Create Account',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 40),
                      
                      // Features list
                      Column(
                        children: [
                          _buildFeatureItem(
                            icon: Icons.search,
                            title: 'Find Local Jobs',
                            description: 'Browse tasks in your area',
                          ),
                          const SizedBox(height: 20),
                          _buildFeatureItem(
                            icon: Icons.attach_money,
                            title: 'Earn Money',
                            description: 'Get paid for your work',
                          ),
                          const SizedBox(height: 20),
                          _buildFeatureItem(
                            icon: Icons.verified,
                            title: 'Safe & Secure',
                            description: 'Verified users and secure payments',
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E3A8A).withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: const Color(0xFF1E3A8A),
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF6B7280),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
