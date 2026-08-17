-- Session numbers are part of the clinical record. Prevent duplicate numbers
-- when two requests attempt to register the next session concurrently.
ALTER TABLE public.treatment_sessions
  ADD CONSTRAINT treatment_sessions_plan_session_number_key
  UNIQUE (treatment_plan_id, session_number);
