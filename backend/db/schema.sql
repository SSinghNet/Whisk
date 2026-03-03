-- ============================================================
-- Whisk Database Schema
-- ============================================================

-- ------------------------------------------------------------
-- UNITS ENUM
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_code') THEN
    CREATE TYPE unit_code AS ENUM (
      'count',
      'gram',
      'ounce',
      'pound',
      'milliliter',
      'liter',
      'gallon',
      'cup',
      'tablespoon',
      'teaspoon'
    );
  END IF;
END$$;


-- ------------------------------------------------------------
-- APP_USER
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_user (
  user_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- INGREDIENT
-- Canonical ingredient names with optional parent hierarchy
-- e.g. "Cherry Tomato" -> parent "Tomato"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredient (
  ingredient_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                 VARCHAR(255) NOT NULL UNIQUE,
  parent_ingredient_id BIGINT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ingredient_parent
    FOREIGN KEY (parent_ingredient_id)
    REFERENCES ingredient(ingredient_id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ingredient_parent
  ON ingredient (parent_ingredient_id);


-- ------------------------------------------------------------
-- PRODUCT
-- Scannable products (barcodes). Each maps to one ingredient.
-- Used for barcode lookup only — pantry tracks ingredients.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product (
  product_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  barcode      VARCHAR(14)  NOT NULL UNIQUE,
  product_name VARCHAR(512),
  brand        VARCHAR(255),
  ingredient_id BIGINT      NOT NULL,
  default_unit  unit_code   NOT NULL DEFAULT 'count',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_product_ingredient
    FOREIGN KEY (ingredient_id)
    REFERENCES ingredient(ingredient_id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_product_name
  ON product (product_name);
CREATE INDEX IF NOT EXISTS idx_product_ingredient
  ON product (ingredient_id);


-- ------------------------------------------------------------
-- LABEL
-- Dietary / category tags e.g. "vegan", "gluten-free"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS label (
  label_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     VARCHAR(255) NOT NULL UNIQUE
);


-- ------------------------------------------------------------
-- PRODUCT_LABEL  (many-to-many: product <-> label)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_label (
  product_id BIGINT NOT NULL,
  label_id   BIGINT NOT NULL,
  PRIMARY KEY (product_id, label_id),
  CONSTRAINT fk_pl_product
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_pl_label
    FOREIGN KEY (label_id)   REFERENCES label(label_id)     ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_label_label_id
  ON product_label (label_id);


-- ------------------------------------------------------------
-- PANTRY
-- One pantry per user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry (
  pantry_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id   BIGINT NOT NULL UNIQUE,
  CONSTRAINT fk_pantry_user
    FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- PANTRY_INGREDIENT
-- What's in a user's pantry, tracked by ingredient (not product).
-- Barcode scan -> resolve to ingredient -> insert here.
-- Manual entry -> pick/create ingredient -> insert here.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pantry_ingredient (
  pantry_id     BIGINT        NOT NULL,
  ingredient_id BIGINT        NOT NULL,
  quantity      NUMERIC(10,3),
  unit          unit_code     NOT NULL,
  expiry_date   DATE          NULL,
  PRIMARY KEY (pantry_id, ingredient_id),
  CONSTRAINT fk_pi_pantry
    FOREIGN KEY (pantry_id)     REFERENCES pantry(pantry_id)              ON DELETE CASCADE,
  CONSTRAINT fk_pi_ingredient
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)      ON DELETE RESTRICT,
  CONSTRAINT chk_pi_qty_nonneg
    CHECK (quantity IS NULL OR quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pantry_ingredient_ingredient_id
  ON pantry_ingredient (ingredient_id);


-- ------------------------------------------------------------
-- RECIPE
-- User-created recipes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe (
  recipe_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      BIGINT        NOT NULL,
  title        VARCHAR(255)  NOT NULL,
  instructions TEXT,
  image_url    TEXT,
  yield_amount NUMERIC(10,3),
  yield_unit   unit_code,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_recipe_user
    FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
  CONSTRAINT chk_yield_valid
    CHECK (
      (yield_amount IS NULL AND yield_unit IS NULL)
      OR (yield_amount IS NOT NULL AND yield_amount > 0 AND yield_unit IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_recipe_user ON recipe (user_id);


-- ------------------------------------------------------------
-- RECIPE_INGREDIENT  (many-to-many: recipe <-> ingredient)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_ingredient (
  recipe_id     BIGINT    NOT NULL,
  ingredient_id BIGINT    NOT NULL,
  amount        NUMERIC(10,3),
  unit          unit_code NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id),
  CONSTRAINT fk_ri_recipe
    FOREIGN KEY (recipe_id)     REFERENCES recipe(recipe_id)         ON DELETE CASCADE,
  CONSTRAINT fk_ri_ingredient
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE RESTRICT,
  CONSTRAINT chk_ri_amount_positive
    CHECK (amount IS NULL OR amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_ingredient_id
  ON recipe_ingredient (ingredient_id);


-- ------------------------------------------------------------
-- RECIPE_LIST
-- Named collections of recipes per user e.g. "Favorites"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_list (
  list_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT        NOT NULL,
  name       VARCHAR(255)  NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_recipe_list_user
    FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_recipe_list_user_name
    UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_recipe_list_user ON recipe_list (user_id);


-- ------------------------------------------------------------
-- RECIPE_LIST_ITEM  (many-to-many: recipe_list <-> recipe)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_list_item (
  list_id   BIGINT      NOT NULL,
  recipe_id BIGINT      NOT NULL,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, recipe_id),
  CONSTRAINT fk_rli_list
    FOREIGN KEY (list_id)   REFERENCES recipe_list(list_id) ON DELETE CASCADE,
  CONSTRAINT fk_rli_recipe
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recipe_list_item_recipe_id
  ON recipe_list_item (recipe_id);
