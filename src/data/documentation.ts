import { site } from '@/config/site'

/**
 * Documentation content. The data is the source of truth for the docs page:
 * sections render in order and drive the sidebar navigation, the on-page
 * table of contents, and client-side search.
 */

export interface DocSection {
  id: string
  title: string
  blocks: DocBlock[]
}

export type DocBlock =
  | { kind: 'p'; text: string }
  | { kind: 'code'; language: string; code: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }

export const docSections: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    blocks: [
      {
        kind: 'p',
        text: 'Kyyinfinite is a free API ecosystem for developers. Every endpoint is free to call and documented in the explorer with a live playground. JSON responses use a consistent envelope; binary endpoints return raw files. This guide covers everything you need to integrate: request format, response format, error handling, and rate limits.',
      },
      {
        kind: 'list',
        items: [
          'No API keys are required for public endpoints.',
          'All responses share one envelope shape.',
          'Every endpoint has a playground preset.',
        ],
      },
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    blocks: [
      {
        kind: 'p',
        text: 'Pick an endpoint from the API Explorer, then call it with any HTTP client. The fastest way to verify your integration is the tools info endpoint, which always returns the platform welcome envelope.',
      },
      {
        kind: 'code',
        language: 'bash',
        code: `curl -X GET "${site.url}/api/v1/tools/info"`,
      },
      {
        kind: 'code',
        language: 'json',
        code: `{
  "status": "success",
  "code": 200,
  "message": "Request completed successfully",
  "data": {
    "message": "Welcome to Kyyinfinite",
    "service": "kyyinfinite",
    "apiVersion": "v1",
    "free": true
  },
  "meta": {
    "request_id": "req_9f2c1a7e84b04d63",
    "timestamp": "2026-11-11T09:00:00.000Z",
    "response_time_ms": 34,
    "api_version": "v1"
  }
}`,
      },
      { kind: 'p', text: 'The base URL is https://api.kyyinfinite.my.id. Every endpoint lives under /api/v1 on that domain. Once your client receives the welcome response, it is ready to call the other endpoints.' },
    ],
  },
  {
    id: 'api-overview',
    title: 'API Overview',
    blocks: [
      {
        kind: 'p',
        text: 'The platform organizes endpoints into categories, and the catalog itself is dynamic: administrators can enable or disable endpoints without a redeployment. The API Explorer always shows the live catalog, and every endpoint page documents its parameters, headers, response schema, and error codes.',
      },
      {
        kind: 'table',
        head: ['Category', 'Base path', 'Focus'],
        rows: [
          ['AI', '/api/v1/ai', 'AI chat models, Bhagavad Gita and Bible assistants'],
          ['Downloader', '/api/v1/downloader · /api/v1/youtube', 'Media download and resolution endpoints'],
          ['Search', '/api/v1/search', 'Apple Music, Spotify, TikTok, and YouTube search'],
          ['Maker', '/api/v1/maker', 'Image, meme, quote, and video generation'],
          ['Tools', '/api/v1/tools · /api/v1/am', 'Translation, OCR, screenshots, image tools, encoders, and Alight Motion activation'],
          ['News', '/api/v1/news', 'News feeds from Indonesian publishers'],
          ['Information', '/api/v1/info', 'World time, caller IP, weather, BMKG, and TV schedule'],
          ['Primbon', '/api/v1/primbon', 'Name, dream, and traditional readings'],
          ['Random', '/api/v1/random', 'Random anime, Blue Archive media, memes, and quotes'],
          ['Stalker', '/api/v1/stalker', 'Public social and gaming profile lookup'],
          ['Anime', '/api/v1/anime', 'Anichin feeds, schedules, and genres'],
          ['Image', '/api/v1/image', 'Reserved for image metadata services'],
          ['WhatsApp', '/api/v1/whatsapp', 'Reserved for WhatsApp bridge services'],
        ],
      },
      {
        kind: 'list',
        items: [
          'GET /api/v1/categories lists every active category as JSON.',
          'GET /api/v1/endpoints lists every active endpoint with full documentation metadata.',
          'GET /api/v1/status exposes public platform health without internal details.',
        ],
      },
    ],
  },
  {
    id: 'request-format',
    title: 'Request Format',
    blocks: [
      {
        kind: 'p',
        text: 'All endpoints accept standard HTTP requests. Query parameters use short lowercase names, JSON bodies must have the application/json content type, and unknown parameters are rejected to catch typos early.',
      },
      {
        kind: 'code',
        language: 'javascript',
        code: `const res = await fetch('${site.url}/api/v1/tools/uuid?count=5', {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
})

const data = await res.json()`,
      },
      {
        kind: 'list',
        items: [
          'Query parameters: short lowercase names, sent in the URL.',
          'JSON bodies: UTF-8 encoded with Content-Type: application/json.',
          'Headers: Accept is optional and defaults to application/json.',
        ],
      },
    ],
  },
  {
    id: 'response-format',
    title: 'Response Format',
    blocks: [
      {
        kind: 'p',
        text: 'Every JSON response uses the same envelope: a status field, an HTTP-equivalent code, a human-readable message, the data payload, and a meta block with the request id, timestamp, measured response time, and API version. Binary endpoints return raw file bytes with their content type. Successful JSON calls return HTTP 200 with status success.',
      },
      {
        kind: 'code',
        language: 'json',
        code: `{
  "status": "success",
  "code": 200,
  "message": "Request completed successfully",
  "data": {
    "query": "laufey",
    "media": { "id": "avjI3_GIZBw", "type": "video" },
    "title": "Laufey: Tiny Desk Concert"
  },
  "meta": {
    "request_id": "req_9f2c1a7e84b04d63",
    "timestamp": "2026-11-11T09:00:00.000Z",
    "response_time_ms": 128,
    "api_version": "v1"
  }
}`,
      },
    ],
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    blocks: [
      {
        kind: 'p',
        text: 'Failures mirror the success envelope: status becomes error, the code field carries the HTTP-equivalent code, and an error object explains what went wrong. Client errors (4xx) mean the request was malformed; server errors (5xx) mean the platform failed and is worth retrying.',
      },
      {
        kind: 'table',
        head: ['Code', 'Name', 'Meaning'],
        rows: [
          ['400', 'BAD_REQUEST', 'The request body is malformed.'],
          ['400', 'INVALID_PARAMS', 'A required parameter is missing or invalid.'],
          ['404', 'NOT_FOUND', 'The endpoint or resource does not exist.'],
          ['405', 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported on this path.'],
          ['413', 'PAYLOAD_TOO_LARGE', 'The request body exceeds the size limit.'],
          ['429', 'RATE_LIMITED', 'Too many requests in the current window.'],
          ['500', 'INTERNAL_ERROR', 'The platform encountered an unexpected error. Retry with backoff.'],
          ['502', 'UPSTREAM_ERROR', 'The service backing this endpoint returned an invalid response.'],
          ['504', 'UPSTREAM_TIMEOUT', 'The service backing this endpoint took too long.'],
        ],
      },
      {
        kind: 'code',
        language: 'json',
        code: `{
  "status": "error",
  "code": 429,
  "message": "Too many requests. Please slow down.",
  "data": null,
  "error": {
    "type": "RATE_LIMITED",
    "details": "Retry after 27 seconds."
  },
  "meta": {
    "request_id": "req_9f2c1a7e84b04d63",
    "timestamp": "2026-11-11T09:00:00.000Z",
    "response_time_ms": 12,
    "api_version": "v1"
  }
}`,
      },
      { kind: 'p', text: 'Error responses never expose internal infrastructure, third-party service details, or stack traces. Every response includes an X-Request-Id header for support conversations.' },
    ],
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits',
    blocks: [
      {
        kind: 'p',
        text: 'Free endpoints are rate limited per client IP to keep the platform fast for everyone. A global rolling window applies to all endpoints together, and heavier endpoints may carry their own lower limit, which is documented on the endpoint page. Every response includes X-RateLimit-Limit and X-RateLimit-Remaining headers.',
      },
      {
        kind: 'list',
        items: [
          'Global window: 120 requests per rolling minute by default.',
          'Endpoint windows: heavier endpoints may allow fewer requests per minute.',
          'Exceeded: HTTP 429 with a Retry-After header.',
          'Sustained abuse triggers a temporary cooldown for the client IP.',
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Examples',
    blocks: [
      {
        kind: 'p',
        text: 'The playground generates ready-to-run snippets for JavaScript, cURL, and Python. Open any endpoint page and press Try this API to load its preset.',
      },
      {
        kind: 'code',
        language: 'python',
        code: `import requests

res = requests.get('${site.url}/api/v1/info/time', params={'tz': 'Asia/Jakarta'}, headers={'Accept': 'application/json'})
print(res.json())`,
      },
      { kind: 'p', text: 'The playground executes real requests against the live platform, so every response you see is exactly what your own code will receive.' },
    ],
  },
]
