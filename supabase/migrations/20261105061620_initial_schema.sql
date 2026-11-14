-- =====================================================================
-- MASNA BUSINESS MANAGEMENT SYSTEM
-- Multi-Tenant Database Schema (Supabase / PostgreSQL 15+)
-- =====================================================================
-- Structure:
--   1. Extensions
--   2. Auth-linked tables (profiles, businesses, business_members)
--   3. Helper functions (for RLS)
--   4. Business-scoped tables (your original 24, upgraded)
--   5. Triggers
--   6. Row Level Security
-- =====================================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. AUTH-LINKED TABLES
-- ============================================================

-- 2.1 profiles : one row per Supabase auth user
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(120) NOT NULL DEFAULT '',
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(25),
  language    CHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en','ar','ur','hi')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 businesses : tenant root
CREATE TABLE businesses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name        VARCHAR(150) NOT NULL,
  name_ur     VARCHAR(150),
  name_ar     VARCHAR(150),
  phone       VARCHAR(25),
  email       VARCHAR(150),
  address     VARCHAR(255),
  city        VARCHAR(80),
  vat_number  VARCHAR(40),
  logo        TEXT,
  currency    CHAR(3) NOT NULL DEFAULT 'SAR',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- 2.3 business_members : who belongs to which business + role
CREATE TABLE business_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL DEFAULT 'staff'
                CHECK (role IN ('owner','manager','staff')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, profile_id)
);
CREATE INDEX idx_bm_profile  ON business_members(profile_id);
CREATE INDEX idx_bm_business ON business_members(business_id);

-- ============================================================
-- 3. HELPER FUNCTIONS (used by RLS)
-- ============================================================

-- returns the current user's active business id
CREATE OR REPLACE FUNCTION current_business_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT business_id
  FROM business_members
  WHERE profile_id = auth.uid() AND is_active = TRUE
  ORDER BY created_at
  LIMIT 1;
$$;

-- does current user have any of the given roles?
CREATE OR REPLACE FUNCTION has_role(p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members
    WHERE profile_id = auth.uid()
      AND is_active = TRUE
      AND role = ANY(p_roles)
  );
$$;

-- ============================================================
-- 4. BUSINESS-SCOPED TABLES
-- ============================================================

-- 4.1 measuring_units
CREATE TABLE measuring_units (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(40) NOT NULL,
  label        VARCHAR(80) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, name)
);
CREATE INDEX idx_mu_business ON measuring_units(business_id);

-- 4.2 app_settings : per profile per business
CREATE TABLE app_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id           UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  default_unit_id       UUID REFERENCES measuring_units(id) ON DELETE SET NULL,
  default_print_format  VARCHAR(12) NOT NULL DEFAULT 'A4'
                         CHECK (default_print_format IN ('A4','A5','thermal80','thermal58')),
  last_print_format     VARCHAR(12)
                         CHECK (last_print_format IN ('A4','A5','thermal80','thermal58')),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, business_id)
);

-- 4.3 sales_form_fields
CREATE TABLE sales_form_fields (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label        VARCHAR(100) NOT NULL,
  label_ur     VARCHAR(100),
  required     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_sff_business ON sales_form_fields(business_id);

-- 4.4 invoice_drafts : one per profile per business
CREATE TABLE invoice_drafts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payload      JSONB NOT NULL,
  saved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, business_id)
);

-- 4.5 categories
CREATE TABLE categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, name)
);
CREATE INDEX idx_categories_business ON categories(business_id);

-- 4.6 products
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sku              VARCHAR(30) NOT NULL,
  name             VARCHAR(150) NOT NULL,
  description      TEXT,
  price            DECIMAL(14,2) NOT NULL CHECK (price > 0),
  cost_price       DECIMAL(14,2) CHECK (cost_price >= 0),
  stock            INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_level  INT NOT NULL DEFAULT 5 CHECK (low_stock_level >= 0),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  unit_id          UUID NOT NULL REFERENCES measuring_units(id) ON DELETE RESTRICT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, sku)
);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name     ON products(name);

-- 4.7 product_images
CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_data  TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 4),
  UNIQUE (product_id, sort_order)
);

-- 4.8 vendors
CREATE TABLE vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  unique_id     VARCHAR(20) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  company_name  VARCHAR(150) NOT NULL,
  phone         VARCHAR(25) NOT NULL,
  vat_number    VARCHAR(40),
  address       VARCHAR(255) NOT NULL,
  city          VARCHAR(80) NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, unique_id)
);
CREATE INDEX idx_vendors_business ON vendors(business_id);

-- 4.9 purchase_orders
CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number    VARCHAR(20) NOT NULL,
  vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  order_date      DATE NOT NULL,
  status          VARCHAR(12) NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending','Received','Cancelled')),
  total_amount    DECIMAL(14,2) NOT NULL DEFAULT 0,
  payment_status  VARCHAR(16) NOT NULL DEFAULT 'Unpaid'
                   CHECK (payment_status IN ('Unpaid','Partially Paid','Paid')),
  payment_amount  DECIMAL(14,2) NOT NULL DEFAULT 0,
  balance_due     DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, order_number)
);
CREATE INDEX idx_po_business ON purchase_orders(business_id);
CREATE INDEX idx_po_vendor   ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status   ON purchase_orders(status, payment_status);

-- 4.10 purchase_order_items
CREATE TABLE purchase_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku           VARCHAR(30) NOT NULL,
  product_name  VARCHAR(150) NOT NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit          VARCHAR(40) NOT NULL,
  unit_price    DECIMAL(14,2) NOT NULL,
  line_total    DECIMAL(14,2) NOT NULL,
  UNIQUE (order_id, product_id)
);

-- 4.11 purchase_payments
CREATE TABLE purchase_payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  payment_date   DATE NOT NULL,
  amount         DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  method         VARCHAR(16) NOT NULL
                  CHECK (method IN ('Cash','Bank Transfer','Card','Other')),
  note           VARCHAR(255),
  balance_after  DECIMAL(14,2) NOT NULL,
  recorded_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.12 purchase_order_status_history
CREATE TABLE purchase_order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  old_status  VARCHAR(12),
  new_status  VARCHAR(12) NOT NULL,
  reason      VARCHAR(255),
  changed_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.13 customers
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(120) NOT NULL,
  company      VARCHAR(150),
  phone        VARCHAR(25),
  phone_alt    VARCHAR(25),
  email        VARCHAR(150),
  address      VARCHAR(255),
  city         VARCHAR(80),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (phone IS NOT NULL OR phone_alt IS NOT NULL),
  UNIQUE (business_id, phone),
  UNIQUE (business_id, phone_alt)
);
CREATE INDEX idx_customers_business ON customers(business_id);

-- 4.14 sales_documents
CREATE TABLE sales_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  document_type       VARCHAR(10) NOT NULL CHECK (document_type IN ('quotation','invoice')),
  order_number        VARCHAR(20) NOT NULL,
  customer_id         UUID REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name       VARCHAR(120) NOT NULL,
  customer_company    VARCHAR(150),
  customer_phone      VARCHAR(25),
  customer_phone_alt  VARCHAR(25),
  customer_email      VARCHAR(150),
  customer_address    VARCHAR(255),
  customer_city       VARCHAR(80),
  issue_date          DATE NOT NULL,
  due_date            DATE,
  sales_channel       VARCHAR(10) NOT NULL DEFAULT 'Offline'
                       CHECK (sales_channel IN ('Online','Offline')),
  status              VARCHAR(10) NOT NULL DEFAULT 'Pending'
                       CHECK (status IN ('Pending','Approved','Rejected')),
  currency            CHAR(3) NOT NULL DEFAULT 'SAR',
  notes               TEXT,
  vat_number          VARCHAR(40),
  vat_rate            DECIMAL(5,2) NOT NULL DEFAULT 15,
  subtotal            DECIMAL(14,2) NOT NULL DEFAULT 0,
  discount_total      DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_total           DECIMAL(14,2) NOT NULL DEFAULT 0,
  grand_total         DECIMAL(14,2) NOT NULL DEFAULT 0,
  payment_status      VARCHAR(16) NOT NULL DEFAULT 'Unpaid'
                       CHECK (payment_status IN ('Unpaid','Partially Paid','Paid')),
  payment_method      VARCHAR(16)
                       CHECK (payment_method IN ('Cash','Bank Transfer','Card','Other')),
  payment_amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
  payment_date        DATE,
  payment_reference   VARCHAR(255),
  balance_due         DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_by          UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, order_number)
);
CREATE INDEX idx_sd_business    ON sales_documents(business_id);
CREATE INDEX idx_sd_customer    ON sales_documents(customer_id);
CREATE INDEX idx_sd_type_status ON sales_documents(document_type, status);
CREATE INDEX idx_sd_issue_date  ON sales_documents(issue_date);

-- 4.15 sales_document_lines
CREATE TABLE sales_document_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES sales_documents(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  material        VARCHAR(150) NOT NULL,
  sku             VARCHAR(30),
  category        VARCHAR(100),
  description     TEXT,
  cost_price      DECIMAL(14,2) NOT NULL DEFAULT 0,
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      DECIMAL(14,2) NOT NULL,
  discount_type   VARCHAR(12) NOT NULL DEFAULT 'percentage'
                   CHECK (discount_type IN ('percentage','fixed')),
  discount_value  DECIMAL(14,2) NOT NULL DEFAULT 0,
  line_total      DECIMAL(14,2) NOT NULL,
  UNIQUE (document_id, product_id)
);
CREATE INDEX idx_sdl_document ON sales_document_lines(document_id);
CREATE INDEX idx_sdl_product  ON sales_document_lines(product_id);

-- 4.16 sales_payments
CREATE TABLE sales_payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    UUID NOT NULL REFERENCES sales_documents(id) ON DELETE CASCADE,
  payment_date   DATE NOT NULL,
  amount         DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  method         VARCHAR(16) NOT NULL
                  CHECK (method IN ('Cash','Bank Transfer','Card','Other')),
  note           VARCHAR(255),
  balance_after  DECIMAL(14,2) NOT NULL,
  recorded_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.17 sales_status_history
CREATE TABLE sales_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES sales_documents(id) ON DELETE CASCADE,
  old_status   VARCHAR(10),
  new_status   VARCHAR(10) NOT NULL,
  reason       VARCHAR(255),
  changed_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.18 accounting_transactions
CREATE TABLE accounting_transactions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  transaction_no           VARCHAR(20) NOT NULL,
  txn_date                 DATE NOT NULL,
  customer_name            VARCHAR(120) NOT NULL,
  company_name             VARCHAR(150),
  invoice_ref              VARCHAR(30),
  type                     VARCHAR(8) NOT NULL CHECK (type IN ('In','Out','Return')),
  amount                   DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  status                   VARCHAR(16) NOT NULL
                            CHECK (status IN ('Paid','Partially Paid','Returned')),
  mode                     VARCHAR(16) NOT NULL
                            CHECK (mode IN ('Cash','Card','Bank Transfer','Other')),
  source_module            VARCHAR(10) NOT NULL DEFAULT 'manual'
                            CHECK (source_module IN ('sales','inventory','manual')),
  sales_document_id        UUID REFERENCES sales_documents(id) ON DELETE SET NULL,
  purchase_order_id        UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  sales_payment_id         UUID REFERENCES sales_payments(id) ON DELETE SET NULL,
  purchase_payment_id      UUID REFERENCES purchase_payments(id) ON DELETE SET NULL,
  original_transaction_id  UUID REFERENCES accounting_transactions(id) ON DELETE SET NULL,
  has_return               BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_file_name        VARCHAR(150),
  invoice_file             TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, transaction_no),
  CHECK (NOT (sales_document_id IS NOT NULL AND purchase_order_id IS NOT NULL))
);
CREATE INDEX idx_txn_business    ON accounting_transactions(business_id);
CREATE INDEX idx_txn_type_date   ON accounting_transactions(type, txn_date);
CREATE INDEX idx_txn_invoice_ref ON accounting_transactions(invoice_ref);

-- 4.19 expenses
CREATE TABLE expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  expense_date  DATE NOT NULL,
  category      VARCHAR(100) NOT NULL,
  amount        DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  description   VARCHAR(255),
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_expenses_date     ON expenses(expense_date);

-- 4.20 sales_returns
CREATE TABLE sales_returns (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id            UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  return_number          VARCHAR(20) NOT NULL,
  document_id            UUID NOT NULL REFERENCES sales_documents(id) ON DELETE RESTRICT,
  linked_transaction_id  UUID REFERENCES accounting_transactions(id) ON DELETE SET NULL,
  return_date            DATE NOT NULL,
  reason                 VARCHAR(255) NOT NULL,
  notes                  VARCHAR(255),
  subtotal               DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_total              DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_return_amount    DECIMAL(14,2) NOT NULL,
  created_by             UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, return_number)
);
CREATE INDEX idx_sr_business ON sales_returns(business_id);

-- 4.21 sales_return_items
CREATE TABLE sales_return_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id      UUID NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
  line_id        UUID NOT NULL REFERENCES sales_document_lines(id) ON DELETE RESTRICT,
  product_name   VARCHAR(150) NOT NULL,
  price          DECIMAL(14,2) NOT NULL,
  original_qty   INT NOT NULL,
  return_qty     INT NOT NULL CHECK (return_qty > 0),
  subtotal       DECIMAL(14,2) NOT NULL,
  tax_amount     DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_amount   DECIMAL(14,2) NOT NULL,
  UNIQUE (return_id, line_id)
);

-- 4.22 stock_movements
CREATE TABLE stock_movements (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id        UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type      VARCHAR(12) NOT NULL
                      CHECK (movement_type IN ('sale','return','purchase','adjustment')),
  qty                INT NOT NULL,
  before_qty         INT NOT NULL,
  after_qty          INT NOT NULL,
  reference          VARCHAR(30),
  sales_document_id  UUID REFERENCES sales_documents(id) ON DELETE SET NULL,
  purchase_order_id  UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  movement_date      DATE NOT NULL,
  created_by         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sm_business ON stock_movements(business_id);
CREATE INDEX idx_sm_product  ON stock_movements(product_id, movement_date);

-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated      BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_businesses_updated    BEFORE UPDATE ON businesses      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated      BEFORE UPDATE ON products        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vendors_updated       BEFORE UPDATE ON vendors         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated     BEFORE UPDATE ON customers       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sales_docs_updated    BEFORE UPDATE ON sales_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_app_settings_updated  BEFORE UPDATE ON app_settings    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- auto-create profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members               ENABLE ROW LEVEL SECURITY;
ALTER TABLE measuring_units                ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_form_fields              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_drafts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_documents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_document_lines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_payments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_status_history           ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements                ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "profiles self read"   ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles self update" ON profiles FOR UPDATE USING (id = auth.uid());

-- ---- businesses ----
CREATE POLICY "businesses member read" ON businesses FOR SELECT
  USING (id IN (SELECT business_id FROM business_members WHERE profile_id = auth.uid() AND is_active));
CREATE POLICY "businesses owner insert" ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses owner update" ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

-- ---- business_members ----
CREATE POLICY "bm member read" ON business_members FOR SELECT
  USING (business_id IN (SELECT business_id FROM business_members WHERE profile_id = auth.uid() AND is_active));
CREATE POLICY "bm owner manage" ON business_members FOR ALL
  USING (business_id IN (SELECT business_id FROM business_members WHERE profile_id = auth.uid() AND role = 'owner'));

-- ---- tenant tables (business_id = current_business_id()) ----
DO $$
DECLARE
  t TEXT;
  tenant_tables TEXT[] := ARRAY[
    'measuring_units','sales_form_fields','categories','products','vendors',
    'purchase_orders','customers','sales_documents','accounting_transactions',
    'expenses','sales_returns','stock_movements'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format(
      'CREATE POLICY "%s tenant read" ON %I FOR SELECT USING (business_id = current_business_id());',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY "%s tenant write" ON %I FOR ALL USING (business_id = current_business_id()) WITH CHECK (business_id = current_business_id());',
      t, t
    );
  END LOOP;
END $$;

-- ---- per-profile tables ----
CREATE POLICY "app_settings own" ON app_settings FOR ALL
  USING (profile_id = auth.uid() AND business_id = current_business_id())
  WITH CHECK (profile_id = auth.uid() AND business_id = current_business_id());

CREATE POLICY "invoice_drafts own" ON invoice_drafts FOR ALL
  USING (profile_id = auth.uid() AND business_id = current_business_id())
  WITH CHECK (profile_id = auth.uid() AND business_id = current_business_id());

-- ---- child tables (infer via parent) ----
CREATE POLICY "product_images via product" ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.business_id = current_business_id()));

CREATE POLICY "poi via order" ON purchase_order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()));

CREATE POLICY "pp via order" ON purchase_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()));

CREATE POLICY "posh via order" ON purchase_order_status_history FOR ALL
  USING (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders o WHERE o.id = order_id AND o.business_id = current_business_id()));

CREATE POLICY "sdl via doc" ON sales_document_lines FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()));

CREATE POLICY "sp via doc" ON sales_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()));

CREATE POLICY "ssh via doc" ON sales_status_history FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_documents d WHERE d.id = document_id AND d.business_id = current_business_id()));

CREATE POLICY "sri via return" ON sales_return_items FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_returns r WHERE r.id = return_id AND r.business_id = current_business_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_returns r WHERE r.id = return_id AND r.business_id = current_business_id()));

-- ============================================================
-- DONE
-- ============================================================