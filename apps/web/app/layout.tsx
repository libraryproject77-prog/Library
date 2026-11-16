import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FXEC ECE Library | Department Library Management System',
  description: 'Department Library Management System for Electronics and Communication Engineering, Francis Xavier Engineering College.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem('fxec_theme');
                document.documentElement.classList.remove('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-content min-h-screen antialiased selection:bg-aura-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}
