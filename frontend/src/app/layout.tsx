import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

function Sidebar() {
  const navItems = [
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Explorer', href: '/explorer', icon: '🧭' },
    { name: 'Resume Intel', href: '/resume-analyzer', icon: '📄' },
    { name: 'Work Planner', href: '/planner', icon: '📅' },
    { name: 'Calendar', href: '/calendar', icon: '⏱️' },
  ];

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-72 glass rounded-[2.5rem] border border-white/5 p-8 flex flex-col z-50 overflow-hidden shadow-2xl shadow-black/50">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      <div className="mb-14 px-2">
        <h2 className="text-3xl font-black tracking-tighter text-white">
          CHRONITY<span className="text-blue-500 animate-pulse">.</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-1">Intelligence Layer</p>
      </div>
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center gap-4 py-4 px-5 rounded-[1.5rem] hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all" />
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-bold text-slate-400 group-hover:text-white transition-colors tracking-tight">{item.name}</span>
          </Link>
        ))}

        {/* Live notification bell — client component with badge */}
        <NotificationBell />
      </nav>
      <div className="pt-8 border-t border-white/5">
        <div className="relative group cursor-pointer overflow-hidden p-5 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-900/40">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <p className="text-xs font-black uppercase tracking-widest text-blue-100 mb-1">System Status</p>
          <p className="text-lg font-bold text-white leading-tight">AI Active</p>
        </div>
      </div>
    </aside>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chronity — Opportunity Intelligence",
  description: "AI-powered opportunity intelligence and career planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-80 min-h-screen p-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
