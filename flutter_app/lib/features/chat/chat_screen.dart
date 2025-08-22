
import 'package:flutter/material.dart';

class ChatScreen extends StatelessWidget {
  final String taskId;
  
  const ChatScreen({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chat - Task $taskId'),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Chat feature coming soon!',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Task ID: $taskId',
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
