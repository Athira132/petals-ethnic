import { createClient } from '@supabase/supabase-js';

const STATIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'ethnics', priority: '0.9', changefreq: 'daily' },
  { path: 'jewellery', priority: '0.9', changefreq: 'daily' },
  { path: 'categories', priority: '0.8', changefreq: 'weekly' },
  { path: 'about', priority: '0.7', changefreq: 'monthly' },
  { path: 'contact', priority: '0.7', changefreq: 'monthly' }
];

const KNOWN_CATEGORIES = [
  { path: 'ethnics/aline-midi-dress', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/aline-kurti-floral-print', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/aline-kurti', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/anarkali', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/codeset', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/tissue-silk-kasavu-kurta', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/normal-kurti', priority: '0.8', changefreq: 'weekly' },
  { path: 'ethnics/kanjeevaram-silk-saree', priority: '0.8', changefreq: 'weekly' },
  { path: 'jewellery/traditional-jewellery', priority: '0.8', changefreq: 'weekly' },
  { path: 'jewellery/designer-earrings-jhumkas', priority: '0.8', changefreq: 'weekly' },
  { path: 'jewellery/statement-necklaces', priority: '0.8', changefreq: 'weekly' },
  { path: 'jewellery/classic-bangles-bracelets', priority: '0.8', changefreq: 'weekly' }
];

export default async function handler(req, res) {
  const baseUrl = 'https://www.petalsethnic.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

  const keyToUse = serviceRoleKey || publishableKey;
  const supabase = createClient(supabaseUrl, keyToUse);

  let productUrls = [];
  let categoryUrls = [...KNOWN_CATEGORIES];

  try {
    // 1. Fetch live active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('active', true);

    if (products && products.length > 0) {
      productUrls = products.map(p => ({
        loc: `${baseUrl}/product/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.split('T')[0] : currentDate,
        changefreq: 'daily',
        priority: '0.8'
      }));
    }

    // 2. Fetch live active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, department, description, updated_at')
      .eq('active', true);

    if (categories && categories.length > 0) {
      const dynamicCats = categories.map(c => {
        let dept = 'ethnics';
        if (c.department === 'jewellery' || (c.description && c.description.includes('<!--DEPT:jewellery-->'))) {
          dept = 'jewellery';
        }
        return {
          loc: `${baseUrl}/${dept}/${c.slug}`,
          lastmod: c.updated_at ? c.updated_at.split('T')[0] : currentDate,
          changefreq: 'weekly',
          priority: '0.8'
        };
      });
      // Merge unique
      const existingLocs = new Set(categoryUrls.map(c => c.loc));
      dynamicCats.forEach(c => {
        if (!existingLocs.has(c.loc)) {
          categoryUrls.push(c);
        }
      });
    }
  } catch (err) {
    console.error('Error fetching sitemap dynamic entries:', err);
  }

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static core routes
  for (const route of STATIC_ROUTES) {
    const loc = route.path ? `${baseUrl}/${route.path}` : `${baseUrl}/`;
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Category routes
  for (const cat of categoryUrls) {
    const loc = cat.loc || `${baseUrl}/${cat.path}`;
    const lastmod = cat.lastmod || currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${cat.changefreq}</changefreq>\n`;
    xml += `    <priority>${cat.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Product detail routes
  for (const prod of productUrls) {
    xml += '  <url>\n';
    xml += `    <loc>${prod.loc}</loc>\n`;
    xml += `    <lastmod>${prod.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${prod.changefreq}</changefreq>\n`;
    xml += `    <priority>${prod.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
