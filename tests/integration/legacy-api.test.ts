import { describe, expect, it } from 'vitest'
import { createTestApp, fakeProviderFetch, jsonResponse, readJson } from '../helpers'

describe('migrated public API registry', () => {

  it('publishes the full migrated catalog as free and keyless', async () => {
    const { app } = createTestApp()
    const response = await app.request('/api/v1/endpoints')
    const body = await readJson(response)
    const endpoints = body.data.endpoints as Array<Record<string, unknown>>

    expect(endpoints).toHaveLength(97)
    expect(endpoints.every((endpoint) => endpoint.auth === 'none' && endpoint.free === true)).toBe(true)
    expect(endpoints.some((endpoint) => endpoint.path === '/api/v1/search/applemusic')).toBe(true)
    expect(endpoints.some((endpoint) => endpoint.path === '/api/v1/maker/brat')).toBe(true)
    expect(endpoints.some((endpoint) => endpoint.path === '/api/v1/ai/deepsearch')).toBe(true)
    expect(endpoints.some((endpoint) => endpoint.path === '/api/v1/ai/gemini')).toBe(true)
    expect(endpoints.some((endpoint) => endpoint.path === '/api/v1/am/verify')).toBe(true)
    for (const path of [
      '/api/v1/ai/gptoss120b',
      '/api/v1/ai/phi2',
      '/api/v1/ai/deepseekr1',
      '/api/v1/search/wikipedia',
      '/api/v1/search/npmjs',
      '/api/v1/search/capcut',
    ]) {
      expect(endpoints.some((endpoint) => endpoint.path === path)).toBe(true)
    }
  })
  it('serves migrated JSON endpoints without a developer API key', async () => {
    const fake = fakeProviderFetch(() => jsonResponse({ result: { tracks: [{ title: 'From upstream' }] } }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request('/api/v1/search/applemusic?q=laufey')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body.status).toBe('success')
    expect(body.data.status).toBe(true)
    expect(body.data.result.tracks[0].title).toBe('From upstream')
    expect(fake.calls[0]?.url).toContain('https://api.nexray.eu.cc/search/applemusic?q=laufey')
    expect(fake.calls[0]?.init?.headers).not.toHaveProperty('Authorization')
  })


  it.each([
    ['chatgpt', '/ai/chatgpt'],
    ['deepsearch', '/ai/deepsearch'],
    ['gemini', '/ai/gemini'],
  ])('routes the %s AI endpoint to Nexray', async (name, upstreamPath) => {
    const fake = fakeProviderFetch(() => jsonResponse({ status: true, result: { answer: `reply from ${name}` } }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request(`/api/v1/ai/${name}?text=hallo`)
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body.status).toBe('success')
    expect(body.data.result.answer).toBe(`reply from ${name}`)
    expect(fake.calls[0]?.url).toBe(`https://api.nexray.eu.cc${upstreamPath}?text=hallo`)
  })

  it.each(['gptoss120b', 'phi2', 'deepseekr1'])(
    'routes the %s AI endpoint to Siputzx and forwards prompt, system and temperature',
    async (name) => {
      const fake = fakeProviderFetch(() => jsonResponse({ status: true, data: { response: `reply from ${name}` } }))
      const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

      const response = await app.request(`/api/v1/ai/${name}?prompt=Halo&system=Be+brief&temperature=0.7`)
      const body = await readJson(response)

      expect(response.status).toBe(200)
      expect(body.status).toBe('success')
      expect(body.data.result.response).toBe(`reply from ${name}`)
      const upstream = new URL(fake.calls[0]?.url ?? '')
      expect(`${upstream.origin}${upstream.pathname}`).toBe(`https://api.siputzx.my.id/api/ai/${name}`)
      expect(upstream.searchParams.get('prompt')).toBe('Halo')
      expect(upstream.searchParams.get('system')).toBe('Be brief')
      expect(upstream.searchParams.get('temperature')).toBe('0.7')
    },
  )

  it.each([
    '/api/v1/ai/phi2?system=missing-prompt',
    '/api/v1/ai/phi2?prompt=hi&temperature=5',
    '/api/v1/ai/phi2?prompt=hi&temperature=abc',
    '/api/v1/ai/gptoss120b?prompt=hi&unknown=1',
  ])('rejects invalid AI input %s before contacting a provider', async (path) => {
    const fake = fakeProviderFetch(() => jsonResponse({ status: true, data: { response: 'x' } }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request(path)

    expect(response.status).toBe(400)
    expect(fake.calls).toHaveLength(0)
  })

  it.each([
    ['wallcraft', '/search/wallcraft', 'nature'],
    ['wikipedia', '/search/wikipedia', 'python'],
    ['stickerly', '/search/stickerly', 'spongebob'],
    ['sfile', '/search/sfile', 'script'],
    ['pinterestvideo', '/search/pinterestvideo', 'animek'],
    ['npmjs', '/search/npmjs', 'react'],
    ['lyrics', '/search/lyrics', 'from the start'],
    ['istock', '/search/istock', 'gunung'],
    ['capcut', '/search/capcut', 'cinematic'],
  ])('routes the %s search endpoint to Nexray', async (name, upstreamPath, keyword) => {
    const fake = fakeProviderFetch(() => jsonResponse({ status: true, author: 'x', result: [{ title: `hit for ${name}` }] }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request(`/api/v1/search/${name}?q=${encodeURIComponent(keyword)}`)
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body.data.result[0].title).toBe(`hit for ${name}`)
    const upstream = new URL(fake.calls[0]?.url ?? '')
    expect(`${upstream.origin}${upstream.pathname}`).toBe(`https://api.nexray.eu.cc${upstreamPath}`)
    expect(upstream.searchParams.get('q')).toBe(keyword)
  })

  it('serves migrated binary endpoints as raw files', async () => {
    const fake = fakeProviderFetch(() => new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request('/api/v1/maker/brat?text=hello')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('image/png')
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3])
  })


  it('does not require a developer key for the Alight Motion custom route', async () => {
    const { app } = createTestApp({ configOverrides: { jagomotionApiKey: '' } })
    const response = await app.request('/api/v1/am/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'developer@example.com' }),
    })
    const body = await readJson(response)

    expect(response.status).toBe(503)
    expect(body.error.type).toBe('SERVICE_UNAVAILABLE')
    expect(body.message).toContain('not configured')
  })

  it('rejects missing required parameters before contacting a provider', async () => {
    const fake = fakeProviderFetch(() => jsonResponse({ result: {} }))
    const { app } = createTestApp({ fetchImpl: fake.fetchImpl })

    const response = await app.request('/api/v1/search/applemusic')
    expect(response.status).toBe(400)
    expect(fake.calls).toHaveLength(0)
  })
})
