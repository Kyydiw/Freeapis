import type { IncomingMessage, ServerResponse } from 'node:http'
import { getRequestListener } from '@hono/node-server'
import { createApp } from '../backend/app'

type Listener = (request: IncomingMessage, response: ServerResponse) => Promise<void>

let listener: Listener | undefined

// The app is created lazily inside the handler so that a configuration or
// startup error is logged and returned as a readable JSON 500 instead of an
// opaque FUNCTION_INVOCATION_FAILED crash at module load.
export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    if (!listener) {
      listener = getRequestListener(createApp().fetch) as Listener
    }
    await listener(request, response)
  } catch (error) {
    listener = undefined
    console.error('[kyyinfinite:startup]', error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    if (!response.headersSent) {
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json; charset=UTF-8')
      response.setHeader('Cache-Control', 'no-store')
      response.end(
        JSON.stringify({
          status: 'error',
          code: 500,
          message: 'The service failed to start. Check the server logs and environment configuration.',
          data: null,
          error: { type: 'INTERNAL_ERROR' },
        }),
      )
    }
  }
}
