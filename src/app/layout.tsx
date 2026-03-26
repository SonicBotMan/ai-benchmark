'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Brain, Menu } from "lucide-react";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
          <Link
            href="/evaluate"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            评测
          </Link>
          <Link
            href="/rankings"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            排行榜
          </Link>
          <Link
            href="/benchmarks"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            测评集
          </Link>
          <Link
            href="/skill"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            技能
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                退出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="hidden sm:inline-flex">
                登录
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon-sm" className="md:hidden">
            <Menu className="size-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
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
              关于
            </a>
            <a href="/docs" className="transition-colors hover:text-foreground">
              文档
            </a>
            <a href="/privacy" className="transition-colors hover:text-foreground">
              隐私政策
            </a>
            <a href="/terms" className="transition-colors hover:text-foreground">
              服务条款
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
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col font-[family-name:var(--font-geist-sans)]">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
