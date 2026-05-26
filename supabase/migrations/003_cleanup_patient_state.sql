-- Data cleanup: normalize dirty patient address.state values
-- The Zod schema was changed from .length(2) to .max(2), but existing
-- records may have state values longer than 2 characters (e.g. "São Paulo").
-- This migration normalizes those to the correct 2-letter UF code.

-- Known full-name → UF mappings (most common dirty values)
WITH state_fixes AS (
  SELECT
    id,
    CASE
      WHEN address->>'state' ILIKE '%acre%' OR address->>'state' ILIKE '%ac%' THEN 'AC'
      WHEN address->>'state' ILIKE '%alagoas%' OR address->>'state' ILIKE '%al%' THEN 'AL'
      WHEN address->>'state' ILIKE '%amapá%' OR address->>'state' ILIKE '%ap%' THEN 'AP'
      WHEN address->>'state' ILIKE '%amazonas%' OR address->>'state' ILIKE '%am%' THEN 'AM'
      WHEN address->>'state' ILIKE '%bahia%' OR address->>'state' ILIKE '%ba%' THEN 'BA'
      WHEN address->>'state' ILIKE '%ceará%' OR address->>'state' ILIKE '%ce%' THEN 'CE'
      WHEN address->>'state' ILIKE '%distrito federal%' OR address->>'state' ILIKE '%df%' THEN 'DF'
      WHEN address->>'state' ILIKE '%espírito santo%' OR address->>'state' ILIKE '%es%' THEN 'ES'
      WHEN address->>'state' ILIKE '%goiás%' OR address->>'state' ILIKE '%go%' THEN 'GO'
      WHEN address->>'state' ILIKE '%maranhão%' OR address->>'state' ILIKE '%ma%' THEN 'MA'
      WHEN address->>'state' ILIKE '%mato grosso do sul%' OR address->>'state' ILIKE '%ms%' THEN 'MS'
      WHEN address->>'state' ILIKE '%mato grosso%' OR address->>'state' ILIKE '%mt%' THEN 'MT'
      WHEN address->>'state' ILIKE '%minas gerais%' OR address->>'state' ILIKE '%mg%' THEN 'MG'
      WHEN address->>'state' ILIKE '%pará%' OR address->>'state' ILIKE '%pa%' THEN 'PA'
      WHEN address->>'state' ILIKE '%paraíba%' OR address->>'state' ILIKE '%pb%' THEN 'PB'
      WHEN address->>'state' ILIKE '%paraná%' OR address->>'state' ILIKE '%pr%' THEN 'PR'
      WHEN address->>'state' ILIKE '%pernambuco%' OR address->>'state' ILIKE '%pe%' THEN 'PE'
      WHEN address->>'state' ILIKE '%piauí%' OR address->>'state' ILIKE '%pi%' THEN 'PI'
      WHEN address->>'state' ILIKE '%rio de janeiro%' OR address->>'state' ILIKE '%rj%' THEN 'RJ'
      WHEN address->>'state' ILIKE '%rio grande do norte%' OR address->>'state' ILIKE '%rn%' THEN 'RN'
      WHEN address->>'state' ILIKE '%rio grande do sul%' OR address->>'state' ILIKE '%rs%' THEN 'RS'
      WHEN address->>'state' ILIKE '%rondônia%' OR address->>'state' ILIKE '%ro%' THEN 'RO'
      WHEN address->>'state' ILIKE '%roraima%' OR address->>'state' ILIKE '%rr%' THEN 'RR'
      WHEN address->>'state' ILIKE '%santa catarina%' OR address->>'state' ILIKE '%sc%' THEN 'SC'
      WHEN address->>'state' ILIKE '%são paulo%' OR address->>'state' ILIKE '%sp%' THEN 'SP'
      WHEN address->>'state' ILIKE '%sergipe%' OR address->>'state' ILIKE '%se%' THEN 'SE'
      WHEN address->>'state' ILIKE '%tocantins%' OR address->>'state' ILIKE '%to%' THEN 'TO'
      ELSE NULL
    END AS fixed_state
  FROM patients
  WHERE
    address IS NOT NULL
    AND address->>'state' IS NOT NULL
    AND LENGTH(address->>'state') > 2
)
UPDATE patients
SET address = jsonb_set(
  address,
  '{state}',
  to_jsonb(state_fixes.fixed_state),
  true
),
    updated_at = now()
FROM state_fixes
WHERE patients.id = state_fixes.id
  AND state_fixes.fixed_state IS NOT NULL;
