-- Persist onboarding progress atomically. PostgREST PATCH returns 204 even
-- when no row matches, so PATCH-then-POST could report false success and lose
-- completed steps under concurrent requests.
-- Reconcile staging environments where the legacy baseline ledger was adopted
-- before this Supabase-owned table existed.
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step text NOT NULL DEFAULT 'empresa',
  completed_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS onboarding_progress_user_idx
  ON public.onboarding_progress (user_id);

CREATE OR REPLACE FUNCTION public.advance_onboarding_progress(
  p_user_id uuid,
  p_step_id text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_completed boolean DEFAULT false
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.onboarding_progress (
    user_id,
    current_step,
    completed_steps,
    data,
    completed
  )
  VALUES (
    p_user_id,
    p_step_id,
    jsonb_build_array(p_step_id),
    COALESCE(p_data, '{}'::jsonb),
    p_completed
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    current_step = EXCLUDED.current_step,
    completed_steps = (
      SELECT jsonb_agg(step_id ORDER BY step_id)
      FROM (
        SELECT DISTINCT value AS step_id
        FROM jsonb_array_elements_text(
          COALESCE(public.onboarding_progress.completed_steps, '[]'::jsonb)
          || jsonb_build_array(p_step_id)
        )
      ) AS unique_steps
    ),
    data = COALESCE(public.onboarding_progress.data, '{}'::jsonb)
      || COALESCE(p_data, '{}'::jsonb),
    completed = public.onboarding_progress.completed OR p_completed,
    updated_at = now();
$$;

REVOKE ALL ON FUNCTION public.advance_onboarding_progress(uuid, text, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.advance_onboarding_progress(uuid, text, jsonb, boolean) TO service_role;
