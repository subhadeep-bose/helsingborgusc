-- Replace upcoming events with actual Sunday training sessions (weeks 8-13)
-- and update weekly training to reflect Sunday 3-5 PM CET at Olympia

BEGIN;

-- Remove old placeholder events
DELETE FROM schedule_entries WHERE category = 'event';

-- Remove old weekly entries (will be replaced with a single entry)
DELETE FROM schedule_entries WHERE category = 'weekly';

-- Insert the single weekly training entry
INSERT INTO schedule_entries (day, time, type, location, category, event_date, sort_order)
VALUES ('Sunday', '15:00 – 17:00 CET', 'Training Session', 'Olympia Cricket Ground', 'weekly', NULL, 1);

-- Insert upcoming sessions (weeks 8-13)
INSERT INTO schedule_entries (day, time, type, location, category, event_date, sort_order) VALUES
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 8)',  'Olympia Cricket Ground', 'event', '2026-02-22', 1),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 9)',  'Olympia Cricket Ground', 'event', '2026-03-01', 2),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 10)', 'Olympia Cricket Ground', 'event', '2026-03-08', 3),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 11) — NOT BOOKED', 'Olympia Cricket Ground', 'event', '2026-03-15', 4),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 12)', 'Olympia Cricket Ground', 'event', '2026-03-22', 5),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 13)', 'Olympia Cricket Ground', 'event', '2026-03-29', 6);

COMMIT;
