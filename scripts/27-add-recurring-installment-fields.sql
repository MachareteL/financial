-- Adicionar campos para gastos recorrentes e parcelados
ALTER TABLE expenses 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('monthly', 'weekly', 'yearly')) DEFAULT NULL,
ADD COLUMN is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN installment_number INTEGER DEFAULT NULL,
ADD COLUMN total_installments INTEGER DEFAULT NULL,
ADD COLUMN installment_value DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN parent_expense_id UUID REFERENCES expenses(id) DEFAULT NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_expenses_recurring ON expenses(is_recurring, recurrence_type);
CREATE INDEX idx_expenses_installment ON expenses(is_installment, parent_expense_id);

-- Comentários para documentação
COMMENT ON COLUMN expenses.is_recurring IS 'Indica se o gasto é recorrente';
COMMENT ON COLUMN expenses.recurrence_type IS 'Tipo de recorrência: monthly, weekly, yearly';
COMMENT ON COLUMN expenses.is_installment IS 'Indica se o gasto é parcelado';
COMMENT ON COLUMN expenses.installment_number IS 'Número da parcela atual';
COMMENT ON COLUMN expenses.total_installments IS 'Total de parcelas';
COMMENT ON COLUMN expenses.installment_value IS 'Valor de cada parcela';
COMMENT ON COLUMN expenses.parent_expense_id IS 'ID do gasto pai (para parcelas)';
