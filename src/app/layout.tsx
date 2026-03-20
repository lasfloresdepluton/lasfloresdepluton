import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavbarWrapper from '@/components/layout/NavbarWrapper';

export const metadata: Metadata = {
  title: 'Las Flores de Plutón | Sahumerios Artesanales',
  description:
    'Sahumerios, conitos y pastas de sahumado artesanales. Seleccioná tus fragancias favoritas y pedí por mayor o menor.',
  keywords: ['sahumerios', 'conitos', 'sahumado', 'fragancias', 'artesanal', 'Las Flores de Plutón'],
  openGraph: {
    title: 'Las Flores de Plutón',
    description: 'Sahumerios artesanales para purificar tu espacio',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#3dbdb5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[color:var(--bg-cream)]">
        <NavbarWrapper />
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
