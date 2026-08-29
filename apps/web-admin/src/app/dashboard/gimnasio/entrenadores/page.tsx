import ComingSoon from '@/components/layout/coming-soon';
import { Users } from 'lucide-react';

export default function GymEntrenadoresPage() {
  return (
    <ComingSoon
      title="Entrenadores del Gimnasio"
      description="Gestiona los entrenadores vinculados a tu gimnasio."
      icon={Users}
      backHref="/dashboard/gimnasio"
    />
  );
}
