-- Add fields for recurring and installment expenses
ALTER TABLE expenses 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('monthly', 'weekly', 'yearly')),
ADD COLUMN is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN installment_number INTEGER,
ADD COLUMN total_installments INTEGER,
ADD COLUMN parent_expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_expenses_recurring ON expenses(is_recurring, recurrence_type);
CREATE INDEX idx_expenses_installment ON expenses(is_installment, parent_expense_id);
CREATE INDEX idx_expenses_parent ON expenses(parent_expense_id);

-- Add comments for documentation
COMMENT ON COLUMN expenses.is_recurring IS 'Indicates if this is a recurring expense';
COMMENT ON COLUMN expenses.recurrence_type IS 'Type of recurrence: monthly, weekly, yearly';
COMMENT ON COLUMN expenses.is_installment IS 'Indicates if this is an installment expense';
COMMENT ON COLUMN expenses.installment_number IS 'Current installment number (1, 2, 3, etc.)';
COMMENT ON COLUMN expenses.total_installments IS 'Total number of installments';
COMMENT ON COLUMN expenses.parent_expense_id IS 'Reference to parent expense for installments';
