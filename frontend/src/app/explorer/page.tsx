'use client';

import { useState, useEffect } from 'react';
import OpportunityCard from '@/components/OpportunityCard';
import { api, Opportunity } from '@/lib/api';

export default function Explorer() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.fetchOpportunities();
                setOpportunities(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = opportunities.filter(opp =>
        opp.role.toLowerCase().includes(search.toLowerCase()) ||
        opp.company.toLowerCase().includes(search.toLowerCase()) ||
        opp.skills.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent relative">
            <div className="mb-14 relative">
                <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
                <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">
                    EXPLORER<span className="text-blue-500 text-6xl">.</span>
                </h1>
                <div className="flex gap-4 items-center relative z-10">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            placeholder="Search roles, companies, or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-8 py-5 rounded-[1.5rem] glass border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                        />
                        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                await api.syncEmails();
                                const data = await api.fetchOpportunities();
                                setOpportunities(data);
                            } catch (err) {
                                alert("Failed to initiate scan.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="px-10 py-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50"
                    >
                        {loading ? 'Scanning...' : 'Scan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(n => <div key={n} className="h-80 glass rounded-[2.5rem] animate-pulse" />)
                ) : filtered.length > 0 ? (
                    filtered.map((opp) => (
                        <OpportunityCard key={opp.id} {...opp} />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
                        <p className="text-slate-500 font-bold text-lg">No intelligence matches in current query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
