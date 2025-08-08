-- CurriJobs demo seed (profiles, tasks across categories, payments)

-- Minimum profiles (link to existing auth.users IDs in Supabase; for local dev, create UUIDs)
INSERT INTO profiles (id, email, full_name, location, rating, total_jobs, total_earnings, is_verified)
VALUES
  ('00000000-0000-0000-0000-000000000001','demo@currijobs.com','Demo User','San José, Costa Rica',4.8,42,850000,true),
  ('00000000-0000-0000-0000-000000000002','maria@example.com','María López','Escazú, Costa Rica',4.6,25,420000,true),
  ('00000000-0000-0000-0000-000000000003','carlos@example.com','Carlos Mendez','San José, Costa Rica',4.7,31,560000,true),
  ('00000000-0000-0000-0000-000000000004','ana@example.com','Ana Jiménez','Heredia, Costa Rica',4.4,15,230000,false)
ON CONFLICT (id) DO NOTHING;

-- Seed tasks near San José across categories (owned by demo user)
INSERT INTO tasks (id, title, description, category, reward, time_estimate, location, latitude, longitude, status, user_id, priority, is_urgent)
VALUES
  ('10000000-0000-0000-0000-000000000001','House Cleaning in San José','Deep clean a 3-bedroom apartment.','cleaning',25000,'3 hours','San José, Costa Rica',9.9286,-84.0909,'open','00000000-0000-0000-0000-000000000001','medium',false),
  ('20000000-0000-0000-0000-000000000001','Fix Leaky Faucet','Kitchen faucet leaking.','plumbing',35000,'1 hour','Escazú, Costa Rica',9.9181,-84.0807,'open','00000000-0000-0000-0000-000000000001','high',true),
  ('30000000-0000-0000-0000-000000000001','Install Light Fixtures','Replace 4 fixtures.','electrician',30000,'2 hours','San Pedro, Costa Rica',9.936,-84.05,'open','00000000-0000-0000-0000-000000000001','medium',false),
  ('40000000-0000-0000-0000-000000000001','Hedge Trimming','Trim hedges in small yard.','gardening',16000,'1.5 hours','San José, Costa Rica',9.929,-84.092,'open','00000000-0000-0000-0000-000000000001','low',false),
  ('50000000-0000-0000-0000-000000000001','Deliver Groceries','Pickup and deliver.','delivery_errands',12000,'1 hour','San José, Costa Rica',9.926,-84.089,'open','00000000-0000-0000-0000-000000000001','low',false),
  ('60000000-0000-0000-0000-000000000001','Dog Walking','30 min walk for labrador.','pet_care',8000,'30 min','San José, Costa Rica',9.932,-84.091,'open','00000000-0000-0000-0000-000000000001','low',false)
ON CONFLICT (id) DO NOTHING;

-- Example payment on a completed task
INSERT INTO payments (id, task_id, payer_id, payee_id, amount, currency, status, payment_method, transaction_id, completed_at, work_started_at, work_ended_at, job_latitude, job_longitude)
VALUES (
  '70000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002', -- payer (María)
  '00000000-0000-0000-0000-000000000001', -- payee (Demo)
  25000,
  'CRC',
  'completed',
  'mobile_payment',
  'SINPE-TEST-123456',
  NOW(),
  NOW() - interval '4 hours',
  NOW() - interval '1 hours',
  9.9286,
  -84.0909
) ON CONFLICT (id) DO NOTHING;

-- Additional completed payments to populate wallet/history
INSERT INTO payments (id, task_id, payer_id, payee_id, amount, currency, status, payment_method, transaction_id, completed_at, work_started_at, work_ended_at, job_latitude, job_longitude)
VALUES
  ('70000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',35000,'CRC','completed','mobile_payment','SINPE-TEST-654321',NOW() - interval '2 days', NOW() - interval '2 days 3 hours', NOW() - interval '2 days 1 hours', 9.9181, -84.0807),
  ('70000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001',30000,'CRC','completed','mobile_payment','SINPE-TEST-789012',NOW() - interval '4 days', NOW() - interval '4 days 5 hours', NOW() - interval '4 days 2 hours', 9.9360, -84.0500),
  ('70000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',16000,'CRC','completed','mobile_payment','SINPE-TEST-456789',NOW() - interval '6 days', NOW() - interval '6 days 2 hours', NOW() - interval '6 days 1 hours', 9.9290, -84.0920)
ON CONFLICT (id) DO NOTHING;

