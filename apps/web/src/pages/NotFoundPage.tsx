import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="h-20 w-20 rounded-2xl bg-brand-primary-light flex items-center justify-center mb-6">
        <GraduationCap className="h-10 w-10 text-brand-primary" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
      <p className="text-lg font-semibold text-text-primary mb-2">Página no encontrada</p>
      <p className="text-text-secondary text-sm mb-8 max-w-sm">
        La ruta que buscás no existe o fue movida. Volvé al inicio para continuar.
      </p>
      <Button variant="primary" asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
