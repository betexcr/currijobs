
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/auth_provider.dart';
import '../../core/database_service.dart';
import '../../core/types.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final DatabaseService _dbService = DatabaseService();
  UserProfile? _userProfile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    setState(() => _isLoading = true);
    
    try {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.user != null) {
        final profile = await _dbService.fetchUserProfile(authProvider.user!.id);
        setState(() {
          _userProfile = profile;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading profile: $e')),
        );
      }
    }
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Sign Out'),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final authProvider = context.read<AuthProvider>();
        await authProvider.signOut();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error signing out: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.of(context).pushNamed('/settings');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadUserProfile,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Profile header
                    _buildProfileHeader(user),
                    
                    const SizedBox(height: 24),
                    
                    // Stats cards
                    _buildStatsCards(),
                    
                    const SizedBox(height: 24),
                    
                    // Menu items
                    _buildMenuItems(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildProfileHeader(User? user) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            CircleAvatar(
              radius: 50,
              backgroundColor: const Color(0xFF1E3A8A),
              child: Text(
                user?.email?.substring(0, 1).toUpperCase() ?? 'U',
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Name and email
            Text(
              _userProfile?.fullName ?? 'User',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            
            const SizedBox(height: 4),
            
            Text(
              user?.email ?? '',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Rating
            if (_userProfile != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    '${_userProfile!.rating.toStringAsFixed(1)} (${_userProfile!.totalReviews} reviews)',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              
              // Member since
              Text(
                'Member since ${_formatDate(_userProfile!.memberSince)}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards() {
    if (_userProfile == null) return const SizedBox.shrink();

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            icon: Icons.work,
            title: 'Tasks',
            value: _userProfile!.completedTasks.toString(),
            color: Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            icon: Icons.attach_money,
            title: 'Earnings',
            value: '\$${_userProfile!.totalEarnings.toStringAsFixed(0)}',
            color: Colors.green,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            icon: Icons.account_balance_wallet,
            title: 'Balance',
            value: '\$${_userProfile!.walletBalance.toStringAsFixed(0)}',
            color: Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItems() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          _buildMenuItem(
            icon: Icons.work,
            title: 'My Tasks',
            subtitle: 'View and manage your tasks',
            onTap: () => Navigator.of(context).pushNamed('/my-tasks'),
          ),
          _buildMenuItem(
            icon: Icons.account_balance_wallet,
            title: 'Wallet',
            subtitle: 'Manage your earnings and payments',
            onTap: () => Navigator.of(context).pushNamed('/wallet'),
          ),
          _buildMenuItem(
            icon: Icons.emoji_events,
            title: 'Rank',
            subtitle: 'View your ranking and achievements',
            onTap: () => Navigator.of(context).pushNamed('/rank'),
          ),
          _buildMenuItem(
            icon: Icons.settings,
            title: 'Settings',
            subtitle: 'App preferences and account settings',
            onTap: () => Navigator.of(context).pushNamed('/settings'),
          ),
          _buildMenuItem(
            icon: Icons.logout,
            title: 'Sign Out',
            subtitle: 'Sign out of your account',
            onTap: _signOut,
            isDestructive: true,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : const Color(0xFF1E3A8A),
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? Colors.red : const Color(0xFF1F2937),
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 12,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}
