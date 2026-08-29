import ComingSoon from '@/components/layout/coming-soon';
import { Building2 } from 'lucide-react';

export default function AdminGimnasiosPage() {
  return (
    <ComingSoon
      title="Gestión de Gimnasios"
      description="Administra los gimnasios y sedes de la plataforma."
      icon={Building2}
      backHref="/dashboard/admin"
    />
  );
}
