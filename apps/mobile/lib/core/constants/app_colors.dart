import 'package:flutter/material.dart';

class AppColors {
  // Negro puro - Fondos principales
  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF0D0D0D);
  static const Color surfaceElevated = Color(0xFF1A1A1A);

  // Rojo - Primary / CTAs
  static const Color primary = Color(0xFFEF4444);
  static const Color primaryLight = Color(0xFFF87171);
  static const Color primaryDark = Color(0xFFDC2626);
  static const Color onPrimary = Color(0xFFFFFFFF);

  // Dorado/Ámbar - Acentos, Gamificación, Rankings
  static const Color accent = Color(0xFFFBBF24);
  static const Color accentLight = Color(0xFFFCD34D);
  static const Color accentDark = Color(0xFFF59E0B);
  static const Color onAccent = Color(0xFF000000);

  // Texto
  static const Color onBackground = Color(0xFFFFFFFF);
  static const Color onSurface = Color(0xFFFFFFFF);
  static const Color onSurfaceVariant = Color(0xFF9CA3AF);

  // Bordes
  static const Color border = Color(0xFF262626);
  static const Color borderLight = Color(0xFF3F3F46);

  // Estados
  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFFBBF24);

  // Muscle Groups (para badges)
  static const Map<String, Color> muscleGroupColors = {
    'PECHO': Color(0xFFEF4444),
    'ESPALDA': Color(0xFF3B82F6),
    'PIERNAS': Color(0xFF8B5CF6),
    'HOMBROS': Color(0xFFF97316),
    'BRAZOS': Color(0xFFEC4899),
    'CORE': Color(0xFF10B981),
    'CARDIO': Color(0xFF06B6D4),
    'OTROS': Color(0xFF6B7280),
  };

  // Levels
  static const Map<String, Color> levelColors = {
    'PRINCIPIANTE': Color(0xFF22C55E),
    'INTERMEDIO': Color(0xFFF97316),
    'AVANZADO': Color(0xFFEF4444),
  };
}