import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BottomNavigation extends StatelessWidget {
  const BottomNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).uri.path;
    
    final navItems = [
      {'name': 'Map', 'icon': '🗺️', 'route': '/main', 'label': 'Map View'},
      {'name': 'Tasks', 'icon': '📋', 'route': '/tasks', 'label': 'Task List'},
      {'name': 'MyTasks', 'icon': '📁', 'route': '/my-tasks', 'label': 'My Tasks'},
      {'name': 'Profile', 'icon': '👤', 'route': '/profile', 'label': 'Profile'},
    ];

    bool isActive(String route) {
      if (route == '/main') {
        return currentPath == '/main';
      }
      return currentPath.startsWith(route);
    }

    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: const Color(0xFFE0E0E0), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: navItems.map((item) {
          final active = isActive(item['route']!);
          return Expanded(
            child: GestureDetector(
              onTap: () => context.go(item['route']!),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: active ? const Color(0xFF1E3A8A) : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      item['icon']!,
                      style: TextStyle(
                        fontSize: 24,
                        color: active ? Colors.white : const Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item['label']!,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: active ? Colors.white : const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
