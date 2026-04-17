DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pantry_ingredient'
      AND column_name = 'pantry_ingredient_id'
  ) THEN
    ALTER TABLE pantry_ingredient
      ADD COLUMN pantry_ingredient_id BIGINT;
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS pantry_ingredient_pantry_ingredient_id_seq;

ALTER SEQUENCE pantry_ingredient_pantry_ingredient_id_seq
  OWNED BY pantry_ingredient.pantry_ingredient_id;

ALTER TABLE pantry_ingredient
  ALTER COLUMN pantry_ingredient_id
  SET DEFAULT nextval('pantry_ingredient_pantry_ingredient_id_seq');

UPDATE pantry_ingredient
SET pantry_ingredient_id = nextval('pantry_ingredient_pantry_ingredient_id_seq')
WHERE pantry_ingredient_id IS NULL;

SELECT setval(
  'pantry_ingredient_pantry_ingredient_id_seq',
  COALESCE((SELECT MAX(pantry_ingredient_id) FROM pantry_ingredient), 1),
  true
);

ALTER TABLE pantry_ingredient
  ALTER COLUMN pantry_ingredient_id SET NOT NULL;

ALTER TABLE pantry_ingredient
  DROP CONSTRAINT IF EXISTS pantry_ingredient_pkey;

ALTER TABLE pantry_ingredient
  ADD CONSTRAINT pantry_ingredient_pkey PRIMARY KEY (pantry_ingredient_id);

CREATE INDEX IF NOT EXISTS idx_pantry_ingredient_user_id
  ON pantry_ingredient (user_id);
