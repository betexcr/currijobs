
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/database_service.dart';
import '../../core/types.dart';

class RankScreen extends StatefulWidget {
  const RankScreen({super.key});

  @override
  State<RankScreen> createState() => _RankScreenState();
}

class _RankScreenState extends State<RankScreen> {
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
        
        if (profile == null) {
          // User profile doesn't exist, log out automatically
          debugPrint('User profile not found, logging out user');
          await authProvider.signOut();
          if (mounted) {
            context.go('/login');
          }
          return;
        }
        
        setState(() {
          _userProfile = profile;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading rank data: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Rank & Achievements',
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
            icon: const Icon(Icons.refresh),
            onPressed: _loadUserProfile,
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
                    _buildUserRankCard(),
                    const SizedBox(height: 24),
                    _buildAchievementsSection(),
                    const SizedBox(height: 24),
                    _buildLeaderboardSection(),
                    const SizedBox(height: 24),
                    _buildStatsSection(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildUserRankCard() {
    final completedTasks = _userProfile?.completedTasks ?? 0;
    final rating = _userProfile?.rating ?? 0.0;
    final totalEarnings = _userProfile?.totalEarnings ?? 0.0;
    
    // Calculate rank based on completed tasks
    String rank = 'Bronze';
    Color rankColor = Colors.orange;
    if (completedTasks >= 50) {
      rank = 'Diamond';
      rankColor = Colors.blue;
    } else if (completedTasks >= 30) {
      rank = 'Gold';
      rankColor = Colors.amber;
    } else if (completedTasks >= 15) {
      rank = 'Silver';
      rankColor = Colors.grey;
    }
    
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [rankColor, rankColor.withOpacity(0.7)],
          ),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Your Rank',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      rank,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    _getRankIcon(rank),
                    color: Colors.white,
                    size: 48,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('Tasks', completedTasks.toString(), Icons.work),
                _buildStatItem('Rating', rating.toStringAsFixed(1), Icons.star),
                _buildStatItem('Earnings', '\$${totalEarnings.toStringAsFixed(0)}', Icons.attach_money),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementsSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Achievements',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            
            const SizedBox(height: 16),
            
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _buildAchievementItem(
                  icon: Icons.work,
                  title: 'First Task',
                  isUnlocked: true,
                  progress: 1.0,
                ),
                _buildAchievementItem(
                  icon: Icons.star,
                  title: '5-Star Rating',
                  isUnlocked: (_userProfile?.rating ?? 0) >= 5.0,
                  progress: (_userProfile?.rating ?? 0) / 5.0,
                ),
                _buildAchievementItem(
                  icon: Icons.attach_money,
                  title: 'Earn \$100',
                  isUnlocked: (_userProfile?.totalEarnings ?? 0) >= 100,
                  progress: ((_userProfile?.totalEarnings ?? 0) / 100).clamp(0.0, 1.0),
                ),
                _buildAchievementItem(
                  icon: Icons.emoji_events,
                  title: '10 Tasks',
                  isUnlocked: (_userProfile?.completedTasks ?? 0) >= 10,
                  progress: ((_userProfile?.completedTasks ?? 0) / 10).clamp(0.0, 1.0),
                ),
                _buildAchievementItem(
                  icon: Icons.speed,
                  title: 'Quick Worker',
                  isUnlocked: false,
                  progress: 0.0,
                ),
                _buildAchievementItem(
                  icon: Icons.verified,
                  title: 'Verified',
                  isUnlocked: _userProfile?.verified ?? false,
                  progress: (_userProfile?.verified ?? false) ? 1.0 : 0.0,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAchievementItem({
    required IconData icon,
    required String title,
    required bool isUnlocked,
    required double progress,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isUnlocked ? const Color(0xFF1E3A8A).withOpacity(0.1) : Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isUnlocked ? const Color(0xFF1E3A8A) : Colors.grey[300]!,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: isUnlocked ? const Color(0xFF1E3A8A) : Colors.grey[400],
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isUnlocked ? const Color(0xFF1E3A8A) : Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          if (!isUnlocked && progress > 0) ...[
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[300],
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF1E3A8A)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLeaderboardSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Top Performers',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                TextButton(
                  onPressed: () => _showComingSoon('View Full Leaderboard'),
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      color: Color(0xFF1E3A8A),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Mock leaderboard data
            _buildLeaderboardItem(
              rank: 1,
              name: 'Sarah Johnson',
              tasks: 45,
              earnings: 1250.0,
              isCurrentUser: false,
            ),
            _buildLeaderboardItem(
              rank: 2,
              name: 'Mike Chen',
              tasks: 38,
              earnings: 980.0,
              isCurrentUser: false,
            ),
            _buildLeaderboardItem(
              rank: 3,
              name: 'You',
              tasks: _userProfile?.completedTasks ?? 0,
              earnings: _userProfile?.totalEarnings ?? 0.0,
              isCurrentUser: true,
            ),
            _buildLeaderboardItem(
              rank: 4,
              name: 'Emma Davis',
              tasks: 25,
              earnings: 650.0,
              isCurrentUser: false,
            ),
            _buildLeaderboardItem(
              rank: 5,
              name: 'Alex Rodriguez',
              tasks: 22,
              earnings: 580.0,
              isCurrentUser: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboardItem({
    required int rank,
    required String name,
    required int tasks,
    required double earnings,
    required bool isCurrentUser,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCurrentUser ? const Color(0xFF1E3A8A).withOpacity(0.1) : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: isCurrentUser ? Border.all(color: const Color(0xFF1E3A8A)) : null,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getRankColor(rank),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                rank.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: isCurrentUser ? const Color(0xFF1E3A8A) : const Color(0xFF1F2937),
                  ),
                ),
                Text(
                  '$tasks tasks • \$${earnings.toStringAsFixed(0)} earned',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          if (isCurrentUser)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E3A8A),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'YOU',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your Statistics',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    icon: Icons.work,
                    title: 'Total Tasks',
                    value: '${_userProfile?.completedTasks ?? 0}',
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    icon: Icons.star,
                    title: 'Average Rating',
                    value: '${(_userProfile?.rating ?? 0).toStringAsFixed(1)}',
                    color: Colors.amber,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    icon: Icons.attach_money,
                    title: 'Total Earnings',
                    value: '\$${(_userProfile?.totalEarnings ?? 0).toStringAsFixed(0)}',
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    icon: Icons.trending_up,
                    title: 'Success Rate',
                    value: _calculateSuccessRate(),
                    color: Colors.purple,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _calculateSuccessRate() {
    final totalReviews = _userProfile?.totalReviews ?? 0;
    final rating = _userProfile?.rating ?? 0;
    if (totalReviews > 0) {
      return '${((rating / 5.0) * 100).toStringAsFixed(0)}%';
    }
    return '0%';
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
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
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  IconData _getRankIcon(String rank) {
    switch (rank) {
      case 'Diamond':
        return Icons.diamond;
      case 'Gold':
        return Icons.emoji_events;
      case 'Silver':
        return Icons.workspace_premium;
      case 'Bronze':
        return Icons.military_tech;
      default:
        return Icons.star;
    }
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return Colors.amber;
      case 2:
        return Colors.grey;
      case 3:
        return Colors.orange;
      default:
        return Colors.grey[400]!;
    }
  }

  void _showComingSoon(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature coming soon!')),
    );
  }
}
