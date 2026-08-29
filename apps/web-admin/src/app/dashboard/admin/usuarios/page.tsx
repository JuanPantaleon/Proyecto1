import ComingSoon from '@/components/layout/coming-soon';
import { Users } from 'lucide-react';

export default function AdminUsuariosPage() {
  return (
    <ComingSoon
      title="Gestión de Usuarios"
      description="Ver, editar y administrar todos los usuarios de la plataforma."
      icon={Users}
      backHref="/dashboard/admin"
    />
  );
}
