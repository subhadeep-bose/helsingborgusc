-- Fix security definer view warning by making it security invoker
-- Since anon/authenticated have SELECT granted, this is safe
ALTER VIEW public.members_public SET (security_invoker = on);