// Generates public/sitemap.xml from the code-level endpoint catalog.
// Run: npm run sitemap   (re-run after adding public endpoints)
import { writeFileSync } from 'node:fs'
import { endpointDefinitions } from '../backend/seed/definitions.js'

const ORIGIN = 'https://api.kyyinfinite.my.id'
const today = new Date().toISOString().slice(0, 10)

const pages: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/apis', priority: '0.9', changefreq: 'weekly' },
  { path: '/docs', priority: '0.9', changefreq: 'monthly' },
  { path: '/playground', priority: '0.8', changefreq: 'monthly' },
  { path: '/status', priority: '0.5', changefreq: 'daily' },
  { path: '/about', priority: '0.4', changefreq: 'yearly' },
]

for (const endpoint of endpointDefinitions) {
  if (endpoint.lifecycle !== 'active' || !endpoint.listed) continue
  pages.push({ path: `/apis/${endpoint.categorySlug}/${endpoint.slug}`, priority: '0.6', changefreq: 'monthly' })
}

const body = pages
  .map(
    (page) =>
      `  <url>\n    <loc>${ORIGIN}${page.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
  )
  .join('\n')

writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
)
console.log(`sitemap.xml written with ${pages.length} URLs`)
