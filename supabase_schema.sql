-- Chronity Database Schema for Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    resume_path VARCHAR(511),
    skills TEXT,
    qualification VARCHAR(255),
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255),
    role VARCHAR(255),
    type VARCHAR(50), -- Internship, Job, etc.
    skills TEXT,
    deadline VARCHAR(100),
    location VARCHAR(255),
    link VARCHAR(511),
    source VARCHAR(100), -- Email, Web, etc.
    description TEXT,
    status VARCHAR(50) DEFAULT 'Detected', -- Detected, Applied, Interviewing, Offer, Rejected
    priority VARCHAR(20) DEFAULT 'Medium', -- High, Medium, Low
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Work Plans Table
CREATE TABLE IF NOT EXISTS work_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    preparation_plan TEXT,
    schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Demo User
INSERT INTO users (id, name, email, skills) 
VALUES (1, 'Demo User', 'demo@example.com', 'Python, React, FastAPI, SQL')
ON CONFLICT (id) DO NOTHING;
