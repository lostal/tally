-- Migration: RBAC and Audit Logging
-- Description: Add audit logging table for tracking privileged operations

-- Tabla de auditoría para operaciones privilegiadas
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,  -- 'void_order', 'refund_payment', 'update_menu', etc.
    resource_type TEXT NOT NULL,  -- 'order', 'payment', 'product', etc.
    resource_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX idx_audit_restaurant ON audit_logs(restaurant_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- RLS policies para audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo managers y owners pueden ver los logs de su restaurante
CREATE POLICY "Users can view audit logs for their restaurant"
    ON audit_logs FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id
            FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Sistema puede insertar logs (usando service role)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE audit_logs IS 'Audit trail for privileged operations and sensitive actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., void_order, refund_payment)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., order, payment, product)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action (JSON format)';
