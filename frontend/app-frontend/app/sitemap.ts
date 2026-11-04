import { MetadataRoute } from 'next'

const BASE_URL = 'https://chillnumbers.com'

// Rutas públicas que Google debe indexar
const PUBLIC_ROUTES = [
  { path: '',          priority: 1.0,  changeFrequency: 'weekly'  },
  { path: '/pricing',  priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/privacy',  priority: 0.5,  changeFrequency: 'yearly'  },
  { path: '/terms',    priority: 0.5,  changeFrequency: 'yearly'  },
  { path: '/cookies',  priority: 0.4,  changeFrequency: 'yearly'  },
  { path: '/refunds',  priority: 0.6,  changeFrequency: 'yearly'  },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const route of PUBLIC_ROUTES) {
    // Versión en inglés (default, sin prefijo de locale)
    entries.push({
      url:              `${BASE_URL}${route.path}`,
      lastModified:     new Date(),
      changeFrequency:  route.changeFrequency,
      priority:         route.priority,
      alternates: {
        languages: {
          en: `${BASE_URL}${route.path}`,
          es: `${BASE_URL}/es${route.path}`,
        },
      },
    })

    // Versión en español (/es/...)
    entries.push({
      url:              `${BASE_URL}/es${route.path}`,
      lastModified:     new Date(),
      changeFrequency:  route.changeFrequency,
      priority:         route.priority,
      alternates: {
        languages: {
          en: `${BASE_URL}${route.path}`,
          es: `${BASE_URL}/es${route.path}`,
        },
      },
    })
  }

  return entries
}
