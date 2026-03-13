const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface Opportunity {
    id: number;
    company: string;
    role: string;
    type: string;
    skills: string;
    deadline: string;
    location: string;
    link: string;
    description: string;
    ats_score?: number;
    match_score?: number;
}

export interface PlanResult {
    company: string;
    role: string;
    deadline: string;
    days_remaining: number;
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    candidate_skills: string[];
    strategy: string;
    interview_tips: string[];
    daily_plan: { day_range: string; focus: string; tasks: string[] }[];
    resources: { title: string; type: string; url: string; priority: string }[];
}

export const api = {
    fetchOpportunities: async (): Promise<Opportunity[]> => {
        const res = await fetch(`${API_BASE_URL}/opportunities`);
        if (!res.ok) throw new Error('Failed to fetch opportunities');
        return res.json();
    },

    syncEmails: async (): Promise<{ processed: number }> => {
        const res = await fetch(`${API_BASE_URL}/sync-emails`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to sync emails');
        return res.json();
    },

    analyzeResume: async (opportunityId: number, file: File | null, useProfile: boolean = false): Promise<{ matching_skills: string[], missing_skills: string[] }> => {
        const formData = new FormData();
        if (file) formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/analyze-resume/${opportunityId}?use_profile=${useProfile}`, {
            method: 'POST',
            body: file ? formData : undefined
        });
        if (!res.ok) throw new Error('Failed to analyze resume');
        return res.json();
    },

    generatePlan: async (opportunityId: number): Promise<PlanResult> => {
        const res = await fetch(`${API_BASE_URL}/generate-plan/${opportunityId}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to generate plan');
        return res.json();
    },

    getProfile: async () => {
        const res = await fetch(`${API_BASE_URL}/profile`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    uploadProfileResume: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/profile/resume`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload profile resume');
        return res.json();
    },

    intelUpload: async (text: string): Promise<{ status: string; extracted: Record<string, any> }> => {
        const res = await fetch(`${API_BASE_URL}/intel-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to process intel upload');
        }
        return res.json();
    },

    getNotifications: async (): Promise<{ count: number; notifications: NotificationItem[] }> => {
        const res = await fetch(`${API_BASE_URL}/notifications`);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
    }
};

export interface NotificationItem {
    id: number;
    company: string;
    role: string;
    type: string;
    deadline: string;
    days_left: number;
    link: string;
    skills: string[];
    matched_skills: string[];
    match_score: number;
    why_apply: string;
}

