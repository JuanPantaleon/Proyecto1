import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'shared/widgets/primary_button.dart';
import 'shared/widgets/stat_card.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.15),
                    AppColors.primary.withValues(alpha: 0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                    child: const Icon(Icons.person_rounded, size: 28, color: AppColors.primary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '¡Bienvenido de vuelta!',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.onSurfaceVariant,
                              ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Juan Pérez',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.accent.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.local_fire_department_rounded, size: 14, color: AppColors.accent),
                        const SizedBox(width: 4),
                        Text(
                          '12 días',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: StatCard(
                    label: 'Peso Actual',
                    value: '82.5 kg',
                    icon: Icons.monitor_weight_rounded,
                    iconColor: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StatCard(
                    label: 'Racha',
                    value: '12 días',
                    icon: Icons.local_fire_department_rounded,
                    iconColor: AppColors.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: StatCard(
                    label: 'Sesiones Totales',
                    value: '47',
                    icon: Icons.fitness_center_rounded,
                    iconColor: AppColors.success,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StatCard(
                    label: 'PRs Registrados',
                    value: '8',
                    icon: Icons.emoji_events_rounded,
                    iconColor: AppColors.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Acciones Rápidas',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                _QuickActionCard(
                  icon: Icons.add_circle_rounded,
                  label: 'Nueva Sesión',
                  color: AppColors.primary,
                  onTap: () => context.go('/sessions'),
                ),
                _QuickActionCard(
                  icon: Icons.timer_rounded,
                  label: 'Timer',
                  color: AppColors.accent,
                  onTap: () {},
                ),
                _QuickActionCard(
                  icon: Icons.list_alt_rounded,
                  label: 'Historial',
                  color: AppColors.success,
                  onTap: () => context.go('/sessions'),
                ),
                _QuickActionCard(
                  icon: Icons.search_rounded,
                  label: 'Catálogo',
                  color: AppColors.primaryLight,
                  onTap: () => context.go('/catalog'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Últimos Entrenamientos',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 12),
            _RecentSessionTile(
              exercise: 'Press Banca',
              date: 'Hace 2 horas',
              sets: 4,
              isgScore: 87.5,
              isPR: true,
            ),
            _RecentSessionTile(
              exercise: 'Sentadilla',
              date: 'Hace 1 día',
              sets: 5,
              isgScore: 92.3,
              isPR: false,
            ),
            _RecentSessionTile(
              exercise: 'Dominadas',
              date: 'Hace 3 días',
              sets: 3,
              isgScore: 65.8,
              isPR: false,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/sessions'),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nueva Sesión'),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 28, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.onSurface,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentSessionTile extends StatelessWidget {
  final String exercise;
  final String date;
  final int sets;
  final double isgScore;
  final bool isPR;

  const _RecentSessionTile({
    required this.exercise,
    required this.date,
    required this.sets,
    required this.isgScore,
    required this.isPR,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.fitness_center_rounded, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        exercise,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.onSurface,
                            ),
                      ),
                    ),
                    if (isPR) const PRBadge(size: 24),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '$date • $sets sets',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
          ISGScoreDisplay(score: isgScore, fontSize: 20, showLabel: false),
        ],
      ),
    );
  }
}