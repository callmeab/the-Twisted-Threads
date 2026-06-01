const fs = require('fs');
const path = require('path');

const siteUrl = 'https://www.twistedthreads.example';
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const productsPath = path.join(__dirname, '..', 'public', 'data', 'products.json');

function build() {
  const staticRoutes = ['/', '/products', '/about', '/contact', '/faq', '/cart', '/wishlist'];
  let urls = staticRoutes.map(p => ({ loc: siteUrl + p, priority: p === '/' ? 1.0 : 0.8 }));

  if (fs.existsSync(productsPath)) {
    try {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      products.forEach(prod => {
        urls.push({ loc: `${siteUrl}/products/${prod.id}`, priority: 0.9 });
      });
    } catch (e) {
      console.error('Failed to read products file', e);
    }
  }

  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  urls.forEach(u => {
    xml.push('  <url>');
    xml.push(`    <loc>${u.loc}</loc>`);
    xml.push(`    <changefreq>weekly</changefreq>`);
    xml.push(`    <priority>${u.priority}</priority>`);
    xml.push('  </url>');
  });
  xml.push('</urlset>');

  fs.writeFileSync(outPath, xml.join('\n'));
  console.log('Sitemap written to', outPath);
}

build();
