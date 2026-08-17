-- Audio is highly sensitive. Upload authorization now happens in the Fastify
-- API, which issues short-lived signed upload tokens only after tenant/patient
-- validation. Do not leave a direct authenticated upload/delete path available.

DROP POLICY IF EXISTS "audio-sessions insert authenticated" ON storage.objects;
DROP POLICY IF EXISTS "audio-sessions delete authenticated" ON storage.objects;
DROP POLICY IF EXISTS "audio-sessions select owner" ON storage.objects;
