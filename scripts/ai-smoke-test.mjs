#!/usr/bin/env node

const baseUrl = process.env.AI_STAGING_URL;
const token = process.env.AI_INTERNAL_SERVICE_TOKEN;
const userId = process.env.AI_SMOKE_USER_ID;
const audioUrl = process.env.AI_SMOKE_AUDIO_URL;
const audioSessionId = process.env.AI_SMOKE_AUDIO_SESSION_ID;

if (!baseUrl || !token || !userId || !audioUrl || !audioSessionId) {
  console.error('Required: AI_STAGING_URL, AI_INTERNAL_SERVICE_TOKEN, AI_SMOKE_USER_ID, AI_SMOKE_AUDIO_URL, AI_SMOKE_AUDIO_SESSION_ID');
  process.exit(2);
}

const response = await fetch(`${baseUrl.replace(/\/$/, '')}/clinical/transcribe`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-internal-token': token,
    'x-user-id': userId,
  },
  body: JSON.stringify({ audio_session_id: audioSessionId, audio_url: audioUrl, language: 'pt' }),
  signal: AbortSignal.timeout(90_000),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`transcription failed: HTTP ${response.status}`);
  process.exit(1);
}

const transcription = typeof body.transcription === 'string' ? body.transcription : '';
console.log(`transcription smoke test passed (chars=${transcription.length})`);
