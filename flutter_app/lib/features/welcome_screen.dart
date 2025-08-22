
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../core/auth_provider.dart';
import '../core/database_service.dart'; // Added import for DatabaseService

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  bool _imageLoaded = false;
  bool _splashTimerComplete = false;
  bool _isLoggingIn = false;
  final TextEditingController _emailController = TextEditingController(text: 'user2@currijobs.com');
  final TextEditingController _passwordController = TextEditingController(text: 'user2123456');

  @override
  void initState() {
    super.initState();
    // Start the splash timer immediately
    _startSplashTimer();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _startSplashTimer() {
    // Show splash for 3 seconds, then transition to login
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _splashTimerComplete = true;
        });
      }
    });
  }

  void _onImageLoaded() {
    setState(() {
      _imageLoaded = true;
    });
  }

  Future<void> _checkUserExists() async {
    try {
      final dbService = DatabaseService();
      final exists = await dbService.checkUserExists(_emailController.text);
      print('User ${_emailController.text} exists: $exists');
      
      if (exists) {
        final userProfile = await dbService.getUserByEmail(_emailController.text);
        if (userProfile != null) {
          print('User profile found: ${userProfile.fullName} (${userProfile.email})');
        }
      }
    } catch (e) {
      print('Error checking user existence: $e');
    }
  }

  Future<void> _handleMockLogin() async {
    setState(() => _isLoggingIn = true);
    
    try {
      print('Attempting mock login with: ${_emailController.text}');
      
      // Simulate login delay
      await Future.delayed(const Duration(seconds: 1));
      
      // Create mock user like React Native app
      final mockUser = {
        'id': '00000000-0000-0000-0000-000000000002',
        'email': 'user2@currijobs.com',
        'created_at': DateTime.now().toIso8601String(),
      };
      
      print('Mock login successful for user: ${mockUser['email']}');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mock login successful!')),
        );
        
        // Navigate to tasks screen
        context.go('/tasks');
      }
    } catch (e) {
      print('Mock login error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Mock login failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoggingIn = false);
      }
    }
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    // Use mock login for testing (like React Native app)
    await _handleMockLogin();
    
    // Uncomment below for real Supabase authentication
    /*
    setState(() => _isLoggingIn = true);
    
    // First check if user exists
    await _checkUserExists();
    
    try {
      print('Attempting login with: ${_emailController.text}');
      final authProvider = context.read<AuthProvider>();
      final response = await authProvider.signIn(_emailController.text, _passwordController.text);
      
      if (response.user != null) {
        print('Login successful for user: ${response.user!.email}');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Login successful!')),
          );
        }
      } else {
        print('Login failed: No user returned');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Login failed: Invalid credentials')),
          );
        }
      }
    } catch (e) {
      print('Login error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoggingIn = false);
      }
    }
    */
  }

  @override
  Widget build(BuildContext context) {
    // Show login screen after 3 seconds, regardless of image load status
    if (!_splashTimerComplete) {
      // Splash screen
      return Scaffold(
        backgroundColor: const Color(0xFFE3923D),
        body: Center(
          child: Image.asset(
            'assets/splash.png',
            width: MediaQuery.of(context).size.width,
            fit: BoxFit.contain,
            frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
              if (wasSynchronouslyLoaded && !_imageLoaded) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _onImageLoaded();
                });
              }
              return child;
            },
            errorBuilder: (context, error, stackTrace) {
              // If image fails to load, still show the splash for 3 seconds
              if (!_imageLoaded) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _onImageLoaded();
                });
              }
              return Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height * 0.5,
                color: const Color(0xFFE3923D),
                child: const Center(
                  child: Icon(
                    Icons.image,
                    size: 100,
                    color: Colors.white,
                  ),
                ),
              );
            },
          ),
        ),
      );
    }

    // Login screen
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Header
              Column(
                children: [
                  Text(
                    'Welcome to CurriJobs',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Login to continue',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
              
              const SizedBox(height: 40),
              
              // Login form
              Column(
                children: [
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      hintText: 'Email',
                      hintStyle: TextStyle(color: Colors.grey[500]),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF1E3A8A)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: TextStyle(color: Colors.grey[500]),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF1E3A8A)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                    ),
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _handleLogin(),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoggingIn ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E3A8A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        _isLoggingIn ? 'Logging in...' : 'Login',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
