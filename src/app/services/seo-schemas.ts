export function productSchema(product: any, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description || product.shortDescription || '',
    sku: product.sku || product.id || undefined,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'The Twisted Threads'
    },
    offers: {
      '@type': 'Offer',
      url: siteUrl,
      priceCurrency: product.currency || 'PKR',
      price: product.price != null ? String(product.price) : undefined,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };
}

export function organizationSchema(org: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    sameAs: org.sameAs || []
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url
    }))
  };
}

export function reviewSchema(review: any, productUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: review.author || 'Customer',
    reviewBody: review.body || review.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating || 5,
      bestRating: 5
    },
    itemReviewed: productUrl ? { '@type': 'Product', 'url': productUrl } : undefined
  };
}

export function localBusinessSchema(biz: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    image: biz.image,
    '@id': biz.url,
    url: biz.url,
    telephone: biz.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.street,
      addressLocality: biz.city,
      addressRegion: biz.region,
      postalCode: biz.postalCode,
      addressCountry: biz.country
    },
    openingHoursSpecification: biz.openingHours || undefined
  };
}
