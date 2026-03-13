'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function NotificationBell() {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchCount = () => {
            fetch(`${API_BASE_URL}/notifications`)
                .then(r => r.json())
                .then(data => setCount(data.count || 0))
                .catch(() => { });
        };
        fetchCount();
        // Re-check every 60 seconds
        const id = setInterval(fetchCount, 60_000);
        return () => clearInterval(id);
    }, []);

    return (
        <Link
            href="/notifications"
            className="group flex items-center gap-4 py-4 px-5 rounded-[1.5rem] hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-all" />
            <span className="text-xl group-hover:scale-110 transition-transform relative">
                🔔
                {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[8px] font-black flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                        {count}
                    </span>
                )}
            </span>
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 group-hover:text-white transition-colors tracking-tight">Alerts</span>
                {count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">{count}</span>
                )}
            </div>
        </Link>
    );
}
