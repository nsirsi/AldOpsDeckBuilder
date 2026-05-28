const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

export function getApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not configured');
  }
  return key;
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(statusCode, message) {
  return jsonResponse(statusCode, { error: message });
}

export function textResponse(statusCode, body, contentType = 'text/plain; charset=utf-8') {
  return {
    statusCode,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
    body,
  };
}

export async function driveFetch(path, searchParams = {}) {
  const key = getApiKey();
  const url = new URL(`${DRIVE_BASE}${path}`);
  url.searchParams.set('key', key);
  for (const [name, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(name, value);
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json();
      detail = payload.error?.message ?? detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }
  return response;
}
