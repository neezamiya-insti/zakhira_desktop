CREATE OR REPLACE FUNCTION public.apply_sales_return_stock_movements(
  p_business_id UUID,
  p_document_id UUID,
  p_return_number TEXT,
  p_return_date DATE,
  p_created_by UUID,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_before_qty INTEGER;
  v_after_qty INTEGER;
  v_inserted_id UUID;
  v_movement_matches BOOLEAN;
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

  IF NOT EXISTS (
    SELECT 1
      FROM public.sales_documents
     WHERE id = p_document_id
       AND business_id = p_business_id
  ) THEN
    RAISE EXCEPTION 'Sales document not found for this business';
  END IF;

  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Return stock items must be an array';
  END IF;

  FOR v_item IN
    SELECT *
      FROM jsonb_to_recordset(p_items) AS item(
        movement_id UUID,
        product_id UUID,
        return_qty INTEGER
      )
  LOOP
    IF v_item.movement_id IS NULL
       OR v_item.product_id IS NULL
       OR v_item.return_qty IS NULL
       OR v_item.return_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid return stock item';
    END IF;

    SELECT stock
      INTO v_before_qty
      FROM public.products
     WHERE id = v_item.product_id
       AND business_id = p_business_id
     FOR UPDATE;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    v_after_qty := v_before_qty + v_item.return_qty;
    v_inserted_id := NULL;

    INSERT INTO public.stock_movements (
      id,
      business_id,
      product_id,
      movement_type,
      qty,
      before_qty,
      after_qty,
      reference,
      sales_document_id,
      movement_date,
      created_by
    )
    VALUES (
      v_item.movement_id,
      p_business_id,
      v_item.product_id,
      'return',
      v_item.return_qty,
      v_before_qty,
      v_after_qty,
      p_return_number,
      p_document_id,
      p_return_date,
      p_created_by
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_inserted_id;

    IF v_inserted_id IS NULL THEN
      SELECT EXISTS (
        SELECT 1
          FROM public.stock_movements
         WHERE id = v_item.movement_id
           AND business_id = p_business_id
           AND product_id = v_item.product_id
           AND movement_type = 'return'
           AND qty = v_item.return_qty
           AND sales_document_id = p_document_id
      )
      INTO v_movement_matches;

      IF NOT v_movement_matches THEN
        RAISE EXCEPTION 'Stock movement ID is already used by another operation';
      END IF;
      CONTINUE;
    END IF;

    UPDATE public.products
       SET stock = v_after_qty
     WHERE id = v_item.product_id
       AND business_id = p_business_id;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_sales_return_stock_movements(
  UUID, UUID, TEXT, DATE, UUID, JSONB
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_sales_return_stock_movements(
  UUID, UUID, TEXT, DATE, UUID, JSONB
) TO authenticated;
