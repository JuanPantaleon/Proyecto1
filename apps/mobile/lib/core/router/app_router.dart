import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/auth/presentation/pages/onboarding_page.dart';
import 'features/dashboard/presentation/pages/dashboard_page.dart';
import 'features/training/presentation/pages/session_list_page.dart';
import 'features/training/presentation/pages/set_entry_page.dart';
import 'features/training/presentation/pages/timer_page.dart';
import 'features/catalog/presentation/pages/exercise_list_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(
        path: '/sessions',
        name: 'sessions',
        builder: (context, state) => const SessionListPage(),
      ),
      GoRoute(
        path: '/session/:sessionId/set-entry',
        name: 'set-entry',
        builder: (context, state) {
          final sessionId = state.pathParameters['sessionId']!;
          return SetEntryPage(sessionId: sessionId);
        },
      ),
      GoRoute(
        path: '/session/:sessionId/timer',
        name: 'timer',
        builder: (context, state) {
          final sessionId = state.pathParameters['sessionId']!;
          return TimerPage(sessionId: sessionId);
        },
      ),
      GoRoute(
        path: '/catalog',
        name: 'catalog',
        builder: (context, state) => const ExerciseListPage(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Página no encontrada: ${state.error}'),
      ),
    ),
  );
});