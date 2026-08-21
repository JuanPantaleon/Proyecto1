import ComingSoon from '@/components/layout/coming-soon';
import { Settings } from 'lucide-react';

export default function AdminConfiguracionPage() {
  return (
    <ComingSoon
      title="Configuración Global"
      description="Ajustes globales y parámetros de la plataforma."
      icon={Settings}
      backHref="/dashboard/admin"
    />
  );
}
