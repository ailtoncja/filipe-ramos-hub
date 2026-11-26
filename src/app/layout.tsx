import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { CARE_PACKAGES } from '@/data/care-packages';
import { carregarCatalogoBase } from '@/lib/catalog.server';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Filipe Ramos Hub — Vídeos, Playlists e Care Packages',
    template: '%s — Filipe Ramos Hub',
  },
  description:
    'Pesquise vídeos, lives e playlists do Filipe Ramos nas fontes da comunidade e acesse Care Packages completos com mods, guias e configs por jogo.',
  icons: {
    icon: '/favicon.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0b0f' },
    { media: '(prefers-color-scheme: light)', color: '#f8f7fb' },
  ],
};

// Abre no escuro cinematográfico por padrão quando o usuário ainda não escolheu um tema.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':true;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const catalogo = await carregarCatalogoBase();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--ink)] antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--ink)]"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader
          atualizadoEm={catalogo.atualizadoEm}
          totalCarePackages={CARE_PACKAGES.length}
        />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
