import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  path: string
  ogImage?: string
  jsonLd?: Record<string, unknown>
  noindex?: boolean
}

const BASE_URL = 'https://www.manatuner.app'

export const PAGE_TITLES: Record<string, string> = {
  '/analyzer': 'Deck Analyzer',
  '/mathematics': 'Mathematics',
  '/land-glossary': 'Land Glossary',
  '/guide': 'User Guide',
  '/library': 'Reading Library',
  '/my-analyses': 'My Analyses',
  '/about': 'About',
  '/privacy': 'Privacy',
}

interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export function buildBreadcrumbs(path: string): Record<string, unknown> {
  const items: BreadcrumbItem[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${BASE_URL}/`,
    },
  ]
  if (path && path !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: PAGE_TITLES[path] || path.replace(/^\//, ''),
      item: `${BASE_URL}${path}`,
    })
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path,
  ogImage = `${BASE_URL}/og-image-v4.jpg`,
  jsonLd,
  noindex = false,
}) => {
  const url = `${BASE_URL}${path}`
  // Escape `<` so any literal `</script>` in serialized fields cannot
  // break out of the JSON-LD <script> block. Harmless for parsers
  // (they'll decode \u003c), critical if a future seed ever contains
  // `</script>` in a curatorNote or description.
  const jsonLdString = useMemo(
    () => (jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null),
    [jsonLd]
  )
  const breadcrumbsString = useMemo(
    () => (noindex ? null : JSON.stringify(buildBreadcrumbs(path)).replace(/</g, '\\u003c')),
    [path, noindex]
  )

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ManaTuner" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdString && <script type="application/ld+json">{jsonLdString}</script>}
      {breadcrumbsString && <script type="application/ld+json">{breadcrumbsString}</script>}
    </Helmet>
  )
}
