import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'shared/widgets/primary_button.dart';

class SetEntryPage extends StatefulWidget {
  final String sessionId;

  const SetEntryPage({super.key, required this.sessionId});

  @override
  State<SetEntryPage> createState() => _SetEntryPageState();
}

class _SetEntryPageState extends State<SetEntryPage> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController();
  final _repsController = TextEditingController();

  String _selectedExercise = 'Press Banca';
  double _variantBonus = 1.0;
  double _penalty = 1.0;

  final List<String> _exercises = [
    'Press Banca Plana',
    'Press Banca Inclinada',
    'Press Banca Declinada',
    'Aperturas con Mancuernas',
    'Crossovers en Polea',
    'Flexiones (Push-ups)',
    'Dominadas (Pull-ups)',
    'Jalón al Pecho',
    'Remo con Barra',
    'Remo con Mancuerna',
    'Sentadilla Libre',
    'Prensa de Piernas',
    'Zancadas',
    'Press Militar',
    'Elevaciones Laterales',
    'Curl Bíceps con Barra',
    'Extensiones Tríceps',
    'Plancha',
    'Crunch Abdominal',
  ];

  @override
  void dispose() {
    _weightController.dispose();
    _repsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Registrar Serie'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/sessions'),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
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
                          Text(
                            'Sesión #${widget.sessionId.substring(0, 8)}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppColors.onSurfaceVariant,
                                ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Registrar nueva serie',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.onSurface,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Ejercicio',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedExercise,
                decoration: const InputDecoration(
                  hintText: 'Seleccionar ejercicio',
                  prefixIcon: Icon(Icons.search_rounded),
                ),
                style: const TextStyle(color: AppColors.onSurface),
                dropdownColor: AppColors.surface,
                items: _exercises.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                onChanged: (v) => setState(() => _selectedExercise = v!),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Peso (kg)',
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _weightController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(
                            hintText: '0.0',
                            suffixText: 'kg',
                          ),
                          style: const TextStyle(color: AppColors.onSurface, fontSize: 18),
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Requerido';
                            final val = double.tryParse(v);
                            if (val == null || val <= 0) return 'Inválido';
                            if (val > 500) return 'Máx 500kg';
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Repeticiones',
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _repsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            hintText: '0',
                            suffixText: 'reps',
                          ),
                          style: const TextStyle(color: AppColors.onSurface, fontSize: 18),
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Requerido';
                            final val = int.tryParse(v);
                            if (val == null || val <= 0) return 'Inválido';
                            if (val > 100) return 'Máx 100';
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                'Ajustes Avanzados',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 12),
              _buildSliderRow(
                label: 'Bonus Variante',
                value: _variantBonus,
                min: 0.5,
                max: 2.0,
                divisions: 15,
                onChanged: (v) => setState(() => _variantBonus = v),
                format: (v) => v.toStringAsFixed(1),
                color: AppColors.accent,
              ),
              const SizedBox(height: 12),
              _buildSliderRow(
                label: 'Penalización',
                value: _penalty,
                min: 0.5,
                max: 1.0,
                divisions: 10,
                onChanged: (v) => setState(() => _penalty = v),
                format: (v) => v.toStringAsFixed(1),
                color: AppColors.error,
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: SecondaryButton(
                      text: 'Cancelar',
                      onPressed: () => context.go('/sessions'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(
                      text: 'Guardar Serie',
                      onPressed: _submitForm,
                      icon: Icons.save_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSliderRow({
    required String label,
    required double value,
    required double min,
    required double max,
    required int divisions,
    required void Function(double) onChanged,
    required String Function(double) format,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'x${format(value)}',
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: color,
            inactiveTrackColor: AppColors.border,
            thumbColor: color,
            overlayColor: color.withValues(alpha: 0.2),
            valueIndicatorColor: color,
            valueIndicatorTextStyle: const TextStyle(color: Colors.white),
          ),
          child: Slider(
            value: value,
            min: min,
            max: max,
            divisions: divisions,
            label: format(value),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final weight = double.parse(_weightController.text);
      final reps = int.parse(_repsController.text);

      // TODO: Llamar API POST /api/v1/entrenamiento/set
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Serie guardada: ${weight}kg x $reps reps (${_selectedExercise})'),
          backgroundColor: AppColors.success,
        ),
      );

      _weightController.clear();
      _repsController.clear();
    }
  }
}