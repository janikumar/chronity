'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await api.getProfile();
            setProfile(data);
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await api.uploadProfileResume(file);
            await loadProfile(); // Reload to get updated skills
        } catch (err) {
            alert("Upload failed. Ensure backend is running.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative">
            {/* Header Area */}
            <header className="mb-16 relative">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
                            IDENTITY<span className="text-indigo-500 text-7xl">.</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
                            Central Resume & Skill Vault
                        </p>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="h-96 glass rounded-[3rem] animate-pulse flex items-center justify-center">
                    <span className="text-white/20 font-black tracking-widest uppercase">Loading Matrix...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Identity Matrix */}
                    <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

                        <div className="mb-10 relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Operative Designation</h2>
                                <p className="text-3xl font-black text-white">{profile?.name || '-'}</p>
                                <p className="text-indigo-400 font-bold mt-1 tracking-wider">{profile?.email || ''}</p>
                            </div>
                            {profile?.qualification && (
                                <div className="text-right">
                                    <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Academic Rank</h2>
                                    <p className="text-lg font-black text-white">{profile.qualification}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-10 relative z-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3">About</h2>
                            <p className="text-slate-300 font-medium italic leading-relaxed">
                                {profile?.summary ? `"${profile.summary}"` : "Matrix analysis pending. Upload resume to synthesize professional bio."}
                            </p>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                Core Skill Matrix
                                {uploading && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                            </h2>

                            {profile?.skills && profile.skills.trim() !== "" ? (
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills.split(',').map((skill: string, i: number) => (
                                        <span key={i} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors shadow-lg shadow-black/20">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 text-center">
                                    <p className="text-slate-400 font-bold">No matrix established. Upload resume to synthesize skills.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Resume Vault */}
                    <div className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-colors duration-500" />

                        <div className="w-24 h-24 mb-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative z-10">
                            <svg className={`w-10 h-10 text-indigo-400 ${uploading ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-white mb-3 relative z-10">Secure Artifact Upload</h3>
                        <p className="text-slate-400 font-bold max-w-xs mb-8 relative z-10">
                            Deploy your latest resume PDF. The AI engine will parse your history and update your core identity matrix.
                        </p>

                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={`relative px-10 py-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all z-10 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? 'Synthesizing...' : 'Select PDF Payload'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
