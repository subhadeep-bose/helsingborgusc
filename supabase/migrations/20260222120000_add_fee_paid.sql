-- Add fee_paid column to members table for membership fee tracking (MVP)
ALTER TABLE members ADD COLUMN IF NOT EXISTS fee_paid boolean NOT NULL DEFAULT false;
