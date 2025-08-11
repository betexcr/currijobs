-- Seed demo data with coherent relationships
-- Users (fixed IDs for 3-test setup)
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001','demo@currijobs.com') ON CONFLICT DO NOTHING;
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000002','user2@currijobs.com') ON CONFLICT DO NOTHING;
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000003','user3@currijobs.com') ON CONFLICT DO NOTHING;

-- Profiles (ensure the 3 testing users exist with basic data)
INSERT INTO profiles (id, email, full_name, location, latitude, longitude, rating, total_jobs, total_earnings, is_verified)
VALUES ('00000000-0000-0000-0000-000000000001','demo@currijobs.com','Demo User','La Nopalera, San José',9.923035,-84.043457,4.8,42,350000,true)
ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email;

INSERT INTO profiles (id, email, full_name, location, latitude, longitude, rating, total_jobs, total_earnings, is_verified)
VALUES ('00000000-0000-0000-0000-000000000002','user2@currijobs.com','User Two','Avenida 24, San José',9.923635,-84.043157,4.5,18,120000,false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, location, latitude, longitude, rating, total_jobs, total_earnings, is_verified)
VALUES ('00000000-0000-0000-0000-000000000003','user3@currijobs.com','User Three','San José Centro',9.922635,-84.043757,4.2,9,60000,false)
ON CONFLICT (id) DO NOTHING;

-- Additional profiles around the area
DO $$
DECLARE i int;
BEGIN
  FOR i IN 2..15 LOOP
    INSERT INTO auth.users (id, email) VALUES (
      uuid_generate_v4(),
      'user'||i||'@demo.local'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END$$;

-- Ensure badges are present (if not already)
INSERT INTO badges (id, name, description, category) VALUES
  ('category-master','Maestro de Categoría','20+ tareas en una misma categoría.','Performance') ON CONFLICT DO NOTHING;
INSERT INTO badges (id, name, description, category) VALUES
  ('attendance','Perfect Attendance','Inicia sesión 30 días seguidos.','Performance') ON CONFLICT DO NOTHING;

-- Tasks: create 12 tasks for demo user as poster, 8 completed with payments and reviews
WITH demo AS (
  SELECT '00000000-0000-0000-0000-000000000001'::uuid AS uid
)
INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id, status, completed_at)
SELECT 
  'Demo Task '||g, 'Demo seeded task #'||g, 
  (ARRAY['cleaning','plumbing','gardening','tech_support','delivery_errands'] )[1 + (g%5)],
  10000 + (g*500), '2h', 'La Nopalera, San José', 9.923035 + (g*0.0002), -84.043457 + (g*0.00015),
  (SELECT uid FROM demo), CASE WHEN g <= 8 THEN 'completed' ELSE 'open' END,
  CASE WHEN g <= 8 THEN now() - (g||' days')::interval ELSE NULL END
FROM generate_series(1,12) AS g;

WITH t AS (
  SELECT id FROM tasks WHERE status='completed' ORDER BY created_at DESC LIMIT 8
), workers AS (
  SELECT id FROM auth.users WHERE id IN ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003')
)
INSERT INTO offers (task_id, user_id, proposed_reward, message, status, accepted_at)
SELECT t.id, (CASE WHEN (row_number() OVER ()) % 2 = 0 THEN '00000000-0000-0000-0000-000000000002'::uuid ELSE '00000000-0000-0000-0000-000000000003'::uuid END) AS user_id,
  12000, 'Can do it fast', 'accepted', now() - interval '1 day'
FROM t
ON CONFLICT DO NOTHING;

WITH ct AS (
  SELECT ta.id AS task_id, ta.reward, ofr.user_id AS worker_id
  FROM tasks ta JOIN offers ofr ON ofr.task_id = ta.id AND ofr.status='accepted'
)
INSERT INTO payments (task_id, payer_id, payee_id, amount, currency, status, payment_method, completed_at)
SELECT ct.task_id, '00000000-0000-0000-0000-000000000001', ct.worker_id, ct.reward, 'CRC', 'completed', 'bank_transfer', now()
FROM ct
ON CONFLICT DO NOTHING;

-- Reviews for completed tasks (reviewer = demo poster, reviewed = worker)
WITH ct AS (
  SELECT ta.id AS task_id, ofr.user_id AS worker_id, p.id AS payment_id
  FROM tasks ta 
  JOIN offers ofr ON ofr.task_id = ta.id AND ofr.status='accepted'
  JOIN payments p ON p.task_id = ta.id AND p.payee_id = ofr.user_id
)
INSERT INTO reviews (task_id, reviewer_id, reviewed_id, rating, comment, is_public, payment_id)
SELECT ct.task_id, '00000000-0000-0000-0000-000000000001', ct.worker_id, (4 + (random()*1))::int, 'Buen trabajo', true, ct.payment_id
FROM ct
ON CONFLICT DO NOTHING;

-- User progress and badges for demo user
INSERT INTO user_progress (user_id, xp, level, rank, badges)
VALUES ('00000000-0000-0000-0000-000000000001', 2400, 24, 'Experto', '["first-job","five-stars"]')
ON CONFLICT (user_id) DO UPDATE SET xp=EXCLUDED.xp, level=EXCLUDED.level, rank=EXCLUDED.rank, badges=EXCLUDED.badges;

INSERT INTO user_badges (user_id, badge_id)
VALUES ('00000000-0000-0000-0000-000000000001','first-job') ON CONFLICT DO NOTHING;
INSERT INTO user_badges (user_id, badge_id)
VALUES ('00000000-0000-0000-0000-000000000001','five-stars') ON CONFLICT DO NOTHING;





