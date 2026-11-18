CREATE TABLE public.sales_quotation_counters (
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL CHECK (last_number > 0),
  PRIMARY KEY (business_id, year)
);

REVOKE ALL ON TABLE public.sales_quotation_counters FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_next_sales_quotation_number(
  p_business_id UUID,
  p_year INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
      FROM public.business_members
     WHERE profile_id = auth.uid()
       AND business_id = p_business_id
       AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  IF p_year < 2000 OR p_year > 9999 THEN
    RAISE EXCEPTION 'Invalid quotation year';
  END IF;

  INSERT INTO public.sales_quotation_counters (business_id, year, last_number)
  SELECT
    p_business_id,
    p_year,
    COALESCE(
      MAX(substring(d.order_number FROM ('^QT-' || p_year || '-([0-9]+)$'))::INTEGER),
      0
    ) + 1
  FROM public.sales_documents AS d
  WHERE d.business_id = p_business_id
    AND d.document_type = 'quotation'
  ON CONFLICT (business_id, year) DO UPDATE
    SET last_number = GREATEST(
      sales_quotation_counters.last_number,
      EXCLUDED.last_number - 1
    ) + 1
  RETURNING last_number INTO v_next_number;

  RETURN 'QT-' || p_year || '-' || LPAD(v_next_number::TEXT, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_next_sales_quotation_number(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_next_sales_quotation_number(UUID, INTEGER) TO authenticated;
