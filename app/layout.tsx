import type { Metadata, Viewport } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
