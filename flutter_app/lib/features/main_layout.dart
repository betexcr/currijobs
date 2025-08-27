import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../components/bottom_navigation.dart';
import 'map/map_screen.dart';
import 'tasks/tasks_screen.dart';
import 'tasks/my_tasks_screen.dart';
import 'profile/profile_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const MapScreen(),
    const TasksScreen(),
    const MyTasksScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigation(),
    );
  }
}

