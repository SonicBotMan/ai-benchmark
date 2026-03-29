'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Brain, Menu, X, Sun, Moon, ExternalLink } from "lucide-react";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useTranslation } from "@/lib/i18n-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Navbar() {
  const { data: session } = useSession();
  const { lang, setLanguage, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleLang = () => {
    const next: 'zh' | 'en' = lang === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  };

  const navLinks = [
    { href: '/evaluate', label: t('nav.evaluate') },
    { href: '/rankings', label: t('nav.rankings') },
    { href: '/benchmarks', label: t('nav.benchmarks') },
    { href: '/skill', label: t('nav.skill') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/api-docs', label: t('nav.api') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Brain className="size-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">AI Benchmark</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* GitHub link */}
          <a
            href="https://github.com/SonicBotMan/ai-benchmark"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          >
            <ExternalLink className="size-3.5" />
            <span>{t('nav.github')}</span>
          </a>
          {/* Theme toggle */}
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} title={isDark ? 'Light' : 'Dark'}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {/* Language toggle */}
          <Button variant="ghost" size="sm" onClick={toggleLang} className="text-xs font-medium">
            {lang === 'zh' ? 'EN' : '中'}
          </Button>

          {session ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" className="hidden sm:inline-flex">
                  {t('nav.dashboard')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="hidden sm:inline-flex">
                {t('nav.login')}
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="container mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border/40" />
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary">
              <Brain className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">AI Benchmark</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/about" className="transition-colors hover:text-foreground">
              {t('nav.about')}
            </a>
            <a href="/docs" className="transition-colors hover:text-foreground">
              {t('nav.docs')}
            </a>
            <a href="/faq" className="transition-colors hover:text-foreground">
              {t('nav.faq')}
            </a>
            <a href="/feedback" className="transition-colors hover:text-foreground">
              {t('nav.feedback')}
            </a>
            <a href="/privacy" className="transition-colors hover:text-foreground">
              {t('nav.privacy')}
            </a>
            <a href="/terms" className="transition-colors hover:text-foreground">
              {t('nav.terms')}
            </a>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Benchmark. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { lang } = useTranslation();
  
  return (
    <html
      lang={lang === 'zh' ? 'zh-CN' : 'en'}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
        <LanguageProvider>
          <SessionProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
