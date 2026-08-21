import ComingSoon from '@/components/layout/coming-soon';
import { Settings } from 'lucide-react';

export default function GymConfiguracionPage() {
  return (
    <ComingSoon
      title="Configuración del Gimnasio"
      description="Ajusta los datos, sedes y preferencias de tu gimnasio."
      icon={Settings}
      backHref="/dashboard/gimnasio"
    />
  );
}
