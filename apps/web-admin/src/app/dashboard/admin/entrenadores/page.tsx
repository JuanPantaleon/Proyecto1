import ComingSoon from '@/components/layout/coming-soon';
import { Users } from 'lucide-react';

export default function AdminEntrenadoresPage() {
  return (
    <ComingSoon
      title="Gestión de Entrenadores"
      description="Ver y administrar los entrenadores de la plataforma."
      icon={Users}
      backHref="/dashboard/admin"
    />
  );
}
