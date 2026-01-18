-- Migration: Add Activity Log System
-- Date: 2026-01-18

-- ============================================
-- ACTIVITY LOG
-- ============================================

CREATE TYPE devices.ACTIVITY_ENTITY_TYPE AS ENUM ('SERVER', 'VM', 'SERVICE');
CREATE TYPE devices.ACTIVITY_ACTION AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED');

CREATE TABLE IF NOT EXISTS devices.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type devices.ACTIVITY_ENTITY_TYPE NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(256) NOT NULL,
  action devices.ACTIVITY_ACTION NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_entity ON devices.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON devices.activity_log(created_at DESC);
CREATE INDEX idx_activity_user ON devices.activity_log(user_id);
CREATE INDEX idx_activity_action ON devices.activity_log(action);
