-- Add responsible_user_id to waste_records if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waste_records' AND column_name = 'responsible_user_id'
  ) THEN
    ALTER TABLE waste_records
      ADD COLUMN responsible_user_id INTEGER;

    ALTER TABLE waste_records
      ADD CONSTRAINT waste_records_responsible_user_fk
      FOREIGN KEY (responsible_user_id)
      REFERENCES users(id);
  END IF;
END $$;