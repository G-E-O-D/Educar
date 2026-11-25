import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

describe('Button', () => {
  it('renderiza el texto del botón', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('aplica variante primary por defecto', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-primary');
  });

  it('se deshabilita cuando disabled=true', () => {
    render(<Button disabled>Test</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('muestra spinner y aria-busy cuando isLoading=true', () => {
    render(<Button isLoading>Cargando</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('llama onClick al hacer click', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Acción</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('no llama onClick cuando está deshabilitado', () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Acción</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('Badge', () => {
  it('renderiza el texto de la insignia', () => {
    render(<Badge>Prototipo</Badge>);
    expect(screen.getByText('Prototipo')).toBeInTheDocument();
  });

  it('aplica clases de variante primary', () => {
    render(<Badge variant="primary">Test</Badge>);
    expect(screen.getByText('Test')).toHaveClass('bg-brand-primary-light');
  });
});

describe('Alert', () => {
  it('tiene role=alert', () => {
    render(<Alert variant="info">Mensaje de prueba</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('muestra el título si se provee', () => {
    render(<Alert variant="success" title="Guardado">Cambios guardados.</Alert>);
    expect(screen.getByText('Guardado')).toBeInTheDocument();
    expect(screen.getByText('Cambios guardados.')).toBeInTheDocument();
  });

  it('llama onDismiss al cerrar', () => {
    const onDismiss = vi.fn();
    render(<Alert variant="error" dismissible onDismiss={onDismiss}>Error</Alert>);
    fireEvent.click(screen.getByLabelText('Cerrar alerta'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe('Input', () => {
  it('renderiza el label asociado al input', () => {
    render(<Input label="Nombre" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Nombre');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('muestra mensaje de error con aria-invalid', () => {
    render(<Input label="Email" error="Formato inválido" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Formato inválido');
  });

  it('muestra hint cuando no hay error', () => {
    render(<Input label="URL" hint="Incluí https://" />);
    expect(screen.getByText('Incluí https://')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renderiza el contenido de la tarjeta', () => {
    render(
      <Card>
        <CardHeader><h3>Título</h3></CardHeader>
        <CardContent><p>Contenido</p></CardContent>
      </Card>
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });
});

describe('Button con asChild (Link)', () => {
  it('renderiza como Link conservando estilos de botón', () => {
    render(
      <MemoryRouter>
        <Button variant="primary" asChild>
          <a href="/demo">Ver demo</a>
        </Button>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'Ver demo' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('bg-brand-primary');
  });
});
