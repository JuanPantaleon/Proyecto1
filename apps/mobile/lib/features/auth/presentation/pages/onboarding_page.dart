import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'shared/widgets/primary_button.dart';

class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.fitness_center_rounded,
                  size: 60,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Ranked Fitness',
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.onBackground,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                'Tu fuerza, tu ranking, tus reglas.\nCompite, progresa, domina.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.onSurfaceVariant,
                      height: 1.5,
                    ),
              ),
              const Spacer(),
              PrimaryButton(
                text: 'Comenzar',
                onPressed: () => context.go('/dashboard'),
                icon: Icons.arrow_forward_rounded,
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  // TODO: Implementar Clerk Flutter auth
                },
                child: Text(
                  'Ya tengo cuenta - Iniciar sesión',
                  style: TextStyle(color: AppColors.accent),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}