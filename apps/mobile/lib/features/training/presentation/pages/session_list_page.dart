import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'shared/widgets/primary_button.dart';
import 'shared/widgets/stat_card.dart';

class SessionListPage extends StatefulWidget {
  const SessionListPage({super.key});

  @override
  State<SessionListPage> createState() => _SessionListPageState();
}

class _SessionListPageState extends State<SessionListPage> {
  final List<_MockSession> _sessions = [
    _MockSession(
      id: '1',
      date: DateTime.now().subtract(const Duration(hours: 2)),
      exercise: 'Press Banca',
      sets: 4,
      totalReps: 32,
      isgAvg: 87.5,
      isPR: true,
      duration: 45 * 60,
    ),
    _MockSession(
      id: '2',
      date: DateTime.now().subtract(const Duration(days: 1)),
      exercise: 'Sentadilla',
      sets: 5,
      totalReps: 40,
      isgAvg: 92.3,
      isPR: false,
      duration: 55 * 60,
    ),
    _MockSession(
      id: '3',
      date: DateTime.now().subtract(const Duration(days: 3)),
      exercise: 'Dominadas',
      sets: 3,
      totalReps: 18,
      isgAvg: 65.8,
      isPR: false,
      duration: 25 * 60,
    ),
    _MockSession(
      id: '4',
      date: DateTime.now().subtract(const Duration(days: 5)),
      exercise: 'Peso Muerto',
      sets: 4,
      totalReps: 28,
      isgAvg: 95.1,
      isPR: true,
      duration: 50 * 60,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mis Sesiones'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: _sessions.isEmpty
          ? _buildEmptyState(context)
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _sessions.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final session = _sessions[index];
                return _SessionTile(
                  session: session,
                  onTap: () => context.go('/session/${session.id}/timer'),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showNewSessionDialog(context),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nueva Sesión'),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.history_rounded,
                size: 48,
                color: AppColors.primary.withValues(alpha: 0.5),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Sin sesiones aún',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.onSurface,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tu historial de entrenamientos aparecerá aquí',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'Crear Primera Sesión',
              onPressed: () => _showNewSessionDialog(context),
              icon: Icons.add_rounded,
              isFullWidth: false,
            ),
          ],
        ),
      ),
    );
  }

  void _showNewSessionDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _NewSessionSheet(
        onCreate: (name) {
          Navigator.pop(context);
          // TODO: Llamar API para crear sesión
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Sesión "$name" creada')),
          );
        },
      ),
    );
  }
}

class _MockSession {
  final String id;
  final DateTime date;
  final String exercise;
  final int sets;
  final int totalReps;
  final double isgAvg;
  final bool isPR;
  final int duration;

  _MockSession({
    required this.id,
    required this.date,
    required this.exercise,
    required this.sets,
    required this.totalReps,
    required this.isgAvg,
    required this.isPR,
    required this.duration,
  });
}

class _SessionTile extends StatelessWidget {
  final _MockSession session;
  final VoidCallback onTap;

  const _SessionTile({
    required this.session,
    required this.onTap,
  });

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inHours < 24) {
      return 'Hace ${diff.inHours}h';
    } else if (diff.inDays == 1) {
      return 'Ayer';
    } else {
      return '${diff.inDays} días';
    }
  }

  String _formatDuration(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    if (h > 0) return '${h}h ${m}min';
    return '${m}min';
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.fitness_center_rounded, color: AppColors.primary, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          session.exercise,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.onSurface,
                              ),
                        ),
                      ),
                      if (session.isPR) const PRBadge(size: 24),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_formatDate(session.date)} • ${session.sets} sets • ${session.totalReps} reps',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.timer_rounded, size: 12, color: AppColors.success),
                            const SizedBox(width: 4),
                            Text(
                              _formatDuration(session.duration),
                              style: TextStyle(
                                color: AppColors.success,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            ISGScoreDisplay(score: session.isgAvg, fontSize: 22, showLabel: false),
          ],
        ),
      ),
    );
  }
}

class _NewSessionSheet extends StatefulWidget {
  final void Function(String name) onCreate;

  const _NewSessionSheet({required this.onCreate});

  @override
  State<_NewSessionSheet> createState() => _NewSessionSheetState();
}

class _NewSessionSheetState extends State<_NewSessionSheet> {
  final _controller = TextEditingController(text: 'Entrenamiento Pecho/Espalda');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Nueva Sesión',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Dale un nombre a tu sesión de entrenamiento',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _controller,
            decoration: const InputDecoration(
              labelText: 'Nombre de la sesión',
              hintText: 'Ej: Pecho/Espalda, Piernas, Full Body...',
              prefixIcon: Icon(Icons.edit_rounded),
            ),
            style: const TextStyle(color: AppColors.onSurface),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: SecondaryButton(
                  text: 'Cancelar',
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryButton(
                  text: 'Crear',
                  onPressed: () {
                    if (_controller.text.trim().isNotEmpty) {
                      widget.onCreate(_controller.text.trim());
                    }
                  },
                  icon: Icons.check_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}