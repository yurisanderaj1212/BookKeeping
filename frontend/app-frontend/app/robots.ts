import { MetadataRoute } from 'next'

const BASE_URL = 'https://chillnumbers.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/privacy',
          '/terms',
          '/cookies',
          '/refunds',
          '/es/',
          '/es/pricing',
          '/es/privacy',
          '/es/terms',
          '/es/cookies',
          '/es/refunds',
        ],
        // Bloquear rutas protegidas — no deben aparecer en Google
        disallow: [
          '/dashboard',
          '/transactions',
          '/accounts',
          '/analytics',
          '/reports',
          '/notifications',
          '/settings',
          '/employees',
          '/plaid-oauth',
          '/subscribe',
          '/es/dashboard',
          '/es/transactions',
          '/es/accounts',
          '/es/analytics',
          '/es/reports',
          '/es/notifications',
          '/es/settings',
          '/es/employees',
          '/es/plaid-oauth',
          '/es/subscribe',
          '/api/',
          '/_next/',
          '/auth/callback',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host:    BASE_URL,
  }
}
