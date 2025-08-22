
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/supabase_client.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/onboarding_screen.dart';
import 'features/tasks/tasks_screen.dart';
import 'features/tasks/my_tasks_screen.dart';
import 'features/tasks/task_detail_screen.dart';
import 'features/tasks/make_offer_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/payment/payment_screen.dart';
import 'features/map/map_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/settings/settings_screen.dart';
import 'features/wallet/wallet_screen.dart';
import 'features/rank/rank_screen.dart';
import 'features/welcome_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await SupabaseManager.initialize();

  runApp(const CurrijobsApp());
}

class CurrijobsApp extends StatefulWidget {
  const CurrijobsApp({super.key});

  @override
  State<CurrijobsApp> createState() => _CurrijobsAppState();
}

class _CurrijobsAppState extends State<CurrijobsApp> {
  late final GoRouter _router = GoRouter(
    routes: <RouteBase>[
      GoRoute(path: '/', builder: (context, state) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/tasks', builder: (context, state) => const TasksScreen()),
      GoRoute(path: '/my-tasks', builder: (context, state) => const MyTasksScreen()),
      GoRoute(path: '/task/:id', builder: (context, state) => const TaskDetailScreen()),
      GoRoute(path: '/make-offer', builder: (context, state) => const MakeOfferScreen()),
      GoRoute(path: '/chat/:taskId', builder: (context, state) => const ChatScreen()),
      GoRoute(path: '/payment/:id', builder: (context, state) => const PaymentScreen()),
      GoRoute(path: '/map', builder: (context, state) => const MapScreen()),
      GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
      GoRoute(path: '/wallet', builder: (context, state) => const WalletScreen()),
      GoRoute(path: '/rank', builder: (context, state) => const RankScreen()),
    ],
    redirect: (context, state) {
      final session = Supabase.instance.client.auth.currentSession;
      final location = state.uri.toString();
      final loggingIn = location == '/login' || location == '/register';
      if (session == null && !loggingIn) return '/login';
      if (session != null && (loggingIn || location == '/')) return '/tasks';
      return null;
    },
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Currijobs',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
