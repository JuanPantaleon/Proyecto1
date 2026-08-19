import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'shared/widgets/primary_button.dart';

class TimerPage extends StatefulWidget {
  final String sessionId;

  const TimerPage({super.key, required this.sessionId});

  @override
  State<TimerPage> createState() => _TimerPageState();
}

class _TimerPageState extends State<TimerPage> {
  Timer? _timer;
  int _elapsedSeconds = 0;
  bool _isRunning = false;
  int _accumulatedSeconds = 0;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    if (_isRunning) return;
    setState(() => _isRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _elapsedSeconds++);
    });
  }

  void _pauseTimer() {
    if (!_isRunning) return;
    _timer?.cancel();
    _accumulatedSeconds += _elapsedSeconds;
    setState(() => _isRunning = false);
  }

  void _resumeTimer() {
    if (_isRunning) return;
    setState(() => _isRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _elapsedSeconds++);
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _accumulatedSeconds += _elapsedSeconds;
    setState(() {
      _isRunning = false;
      _elapsedSeconds = 0;
    });
    // TODO: Llamar API PUT /api/v1/entrenamiento/sesion/:id/timer/detener
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      _elapsedSeconds = 0;
      _accumulatedSeconds = 0;
    });
  }

  int get _totalSeconds => _accumulatedSeconds + _elapsedSeconds;

  String _formatTime(int seconds) {
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    final s = seconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Timer de Sesión'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            if (_isRunning) {
              _showExitConfirmation(context);
            } else {
              context.go('/sessions');
            }
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Spacer(),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: _isRunning ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
                boxShadow: _isRunning
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ]
                    : null,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: (_isRunning ? AppColors.primary : AppColors.onSurfaceVariant)
                              .withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: _isRunning ? AppColors.primary : AppColors.onSurfaceVariant,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _isRunning ? 'EN MARCHA' : 'DETENIDO',
                              style: TextStyle(
                                color: _isRunning ? AppColors.primary : AppColors.onSurfaceVariant,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _formatTime(_totalSeconds),
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 72,
                      fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                      letterSpacing: -2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tiempo total de sesión',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            if (!_isRunning && _totalSeconds == 0) ...[
              PrimaryButton(
                text: 'Iniciar Sesión',
                onPressed: _startTimer,
                icon: Icons.play_arrow_rounded,
              ),
            ] else if (_isRunning) ...[
              Row(
                children: [
                  Expanded(
                    child: SecondaryButton(
                      text: 'Pausar',
                      onPressed: _pauseTimer,
                      icon: Icons.pause_rounded,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(
                      text: 'Finalizar',
                      onPressed: _stopTimer,
                      icon: Icons.stop_rounded,
                      backgroundColor: AppColors.error,
                    ),
                  ),
                ],
              ),
            ] else ...[
              Row(
                children: [
                  Expanded(
                    child: PrimaryButton(
                      text: 'Reanudar',
                      onPressed: _resumeTimer,
                      icon: Icons.play_arrow_rounded,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SecondaryButton(
                      text: 'Reiniciar',
                      onPressed: _resetTimer,
                      icon: Icons.refresh_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              PrimaryButton(
                text: 'Finalizar Sesión',
                onPressed: _stopTimer,
                icon: Icons.flag_rounded,
                backgroundColor: AppColors.accent,
                foregroundColor: AppColors.onAccent,
              ),
            ],
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _StatItem(
                  label: 'Acumulado',
                  value: _formatTime(_accumulatedSeconds),
                  icon: Icons.history_rounded,
                  color: AppColors.accent,
                ),
                _StatItem(
                  label: 'Actual',
                  value: _formatTime(_elapsedSeconds),
                  icon: Icons.timer_rounded,
                  color: _isRunning ? AppColors.primary : AppColors.onSurfaceVariant,
                ),
                _StatItem(
                  label: 'Descansos',
                  value: '0',
                  icon: Icons.coffee_rounded,
                  color: AppColors.success,
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showExitConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('¿Salir del timer?'),
        content: const Text('El timer está en marcha. Si sales se pausará automáticamente.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          PrimaryButton(
            text: 'Salir y Pausar',
            onPressed: () {
              _pauseTimer();
              Navigator.pop(context);
              context.go('/sessions');
            },
            isFullWidth: false,
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                fontFamily: 'monospace',
                color: AppColors.onSurface,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.onSurfaceVariant,
              ),
        ),
      ],
    );
  }
}