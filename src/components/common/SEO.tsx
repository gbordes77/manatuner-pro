import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  path: string
  ogImage?: string
  jsonLd?: Record<string, unknown>
}

const BASE_URL = 'https://www.manatuner.app'

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path,
  ogImage = `${BASE_URL}/og-image-v3.jpg`,
  jsonLd,
}) => {
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

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

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
