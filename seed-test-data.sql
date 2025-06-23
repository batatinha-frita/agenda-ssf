-- Script para inserir dados de teste no banco
-- Execute este SQL no seu banco de dados PostgreSQL

-- Inserir clínica de teste
INSERT INTO clinics (id, name, created_at, updated_at) 
VALUES (
  'test-clinic-id-123',
  'Clínica de Testes',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Inserir médico de teste  
INSERT INTO doctors (id, clinic_id, name, specialty, appointment_price_in_cents, 
                    available_from_week_day, available_to_week_day, 
                    available_from_time, available_to_time, created_at, updated_at)
VALUES (
  'test-doctor-id-123',
  'test-clinic-id-123',
  'Dr. João Silva', 
  'Cardiologia',
  15000,
  1,
  5,
  '08:00',
  '18:00',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Inserir pacientes de teste
INSERT INTO patients (id, clinic_id, name, email, phone_number, sex, created_at, updated_at)
VALUES 
  ('test-patient-1', 'test-clinic-id-123', 'Maria Santos', 'maria@email.com', '(11) 99999-1111', 'female', NOW(), NOW()),
  ('test-patient-2', 'test-clinic-id-123', 'João Silva', 'joao@email.com', '(11) 99999-2222', 'male', NOW(), NOW()),
  ('test-patient-3', 'test-clinic-id-123', 'Ana Costa', 'ana@email.com', '(11) 99999-3333', 'female', NOW(), NOW()),
  ('test-patient-4', 'test-clinic-id-123', 'Pedro Oliveira', 'pedro@email.com', '(11) 99999-4444', 'male', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Inserir consultas de teste
-- Consultas pagas (passadas)
INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, date, appointment_price_in_cents, payment_status, appointment_status, created_at, updated_at)
VALUES 
  ('test-appt-1', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-1', 
   CURRENT_DATE - INTERVAL '10 days', 15000, 'paid', 'completed', NOW(), NOW()),
  ('test-appt-2', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-2', 
   CURRENT_DATE - INTERVAL '5 days', 15000, 'paid', 'completed', NOW(), NOW()),
   
  -- Consultas em aberto (futuras)
  ('test-appt-3', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-3', 
   CURRENT_DATE + INTERVAL '3 days', 20000, 'pending', 'confirmed', NOW(), NOW()),
  ('test-appt-4', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-4', 
   CURRENT_DATE + INTERVAL '7 days', 18000, 'pending', 'confirmed', NOW(), NOW()),
   
  -- Consultas em atraso
  ('test-appt-5', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-1', 
   CURRENT_DATE - INTERVAL '15 days', 15000, 'pending', 'completed', NOW(), NOW()),
  ('test-appt-6', 'test-clinic-id-123', 'test-doctor-id-123', 'test-patient-2', 
   CURRENT_DATE - INTERVAL '20 days', 15000, 'overdue', 'completed', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar os dados inseridos
SELECT 'Clínicas' as tabela, COUNT(*) as total FROM clinics WHERE name = 'Clínica de Testes'
UNION ALL
SELECT 'Médicos', COUNT(*) FROM doctors WHERE clinic_id = 'test-clinic-id-123'
UNION ALL  
SELECT 'Pacientes', COUNT(*) FROM patients WHERE clinic_id = 'test-clinic-id-123'  
UNION ALL
SELECT 'Consultas', COUNT(*) FROM appointments WHERE clinic_id = 'test-clinic-id-123';
