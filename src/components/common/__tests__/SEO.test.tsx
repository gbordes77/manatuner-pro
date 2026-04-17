import { describe, test, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO, buildBreadcrumbs, PAGE_TITLES } from '../SEO'

const BASE_URL = 'https://www.manatuner.app'

describe('buildBreadcrumbs', () => {
  test('returns Home-only list for root path', () => {
    const result = buildBreadcrumbs('/') as Record<string, unknown> & {
      itemListElement: Array<{ position: number; name: string; item: string }>
    }
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(1)
    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${BASE_URL}/`,
    })
  })

  test('produces 2-item ListItem array for /analyzer using PAGE_TITLES lookup', () => {
    const result = buildBreadcrumbs('/analyzer') as {
      itemListElement: Array<{ position: number; name: string; item: string }>
    }
    expect(result.itemListElement).toHaveLength(2)
    expect(result.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: PAGE_TITLES['/analyzer'],
      item: `${BASE_URL}/analyzer`,
    })
    expect(PAGE_TITLES['/analyzer']).toBe('Deck Analyzer')
  })

  test('falls back to path slug when PAGE_TITLES key missing', () => {
    const result = buildBreadcrumbs('/unknown-route') as {
      itemListElement: Array<{ position: number; name: string; item: string }>
    }
    expect(result.itemListElement[1].name).toBe('unknown-route')
  })
})

describe('SEO component', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  const renderSEO = (props: Parameters<typeof SEO>[0]) =>
    render(
      <HelmetProvider>
        <SEO {...props} />
      </HelmetProvider>
    )

  test('renders canonical link with correct absolute URL', async () => {
    renderSEO({ title: 'Test', description: 'd', path: '/analyzer' })
    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]')
      expect(canonical?.getAttribute('href')).toBe(`${BASE_URL}/analyzer`)
    })
  })

  test('noindex=true emits robots meta and suppresses breadcrumb JSON-LD', async () => {
    renderSEO({ title: 'Private', description: 'd', path: '/my-analyses', noindex: true })
    await waitFor(() => {
      const robots = document.head.querySelector('meta[name="robots"]')
      expect(robots?.getAttribute('content')).toBe('noindex,follow')
    })
    const ldScripts = document.head.querySelectorAll('script[type="application/ld+json"]')
    const hasBreadcrumb = Array.from(ldScripts).some((s) =>
      s.textContent?.includes('BreadcrumbList')
    )
    expect(hasBreadcrumb).toBe(false)
  })

  test('jsonLd prop is serialized as application/ld+json and round-trips valid JSON', async () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'ManaTuner',
    }
    renderSEO({ title: 'T', description: 'd', path: '/analyzer', jsonLd: payload })
    await waitFor(() => {
      const ldScripts = Array.from(
        document.head.querySelectorAll('script[type="application/ld+json"]')
      )
      const match = ldScripts.find((s) => s.textContent?.includes('WebApplication'))
      expect(match).toBeTruthy()
      expect(() => JSON.parse(match!.textContent!)).not.toThrow()
      expect(JSON.parse(match!.textContent!)).toEqual(payload)
    })
  })

  test('default page (no noindex, no jsonLd) still emits breadcrumb JSON-LD', async () => {
    renderSEO({ title: 'Home', description: 'd', path: '/' })
    await waitFor(() => {
      const ldScripts = Array.from(
        document.head.querySelectorAll('script[type="application/ld+json"]')
      )
      const breadcrumb = ldScripts.find((s) => s.textContent?.includes('BreadcrumbList'))
      expect(breadcrumb).toBeTruthy()
      const parsed = JSON.parse(breadcrumb!.textContent!)
      expect(parsed['@type']).toBe('BreadcrumbList')
    })
  })
})
