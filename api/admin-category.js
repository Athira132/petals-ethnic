import { createClient } from '@supabase/supabase-js';

const JEWELLERY_KEYWORDS = ['necklace', 'necklaces', 'earring', 'earrings', 'bangle', 'bangles', 'ring', 'rings', 'bracelet', 'bracelets', 'chain', 'chains', 'jewellery', 'jewelry', 'pendant', 'anklet'];

function detectDepartment(cat) {
  if (cat.department && (cat.department === 'jewellery' || cat.department === 'ethnic')) {
    return cat.department;
  }
  if (cat.description && cat.description.includes('<!--DEPT:jewellery-->')) {
    return 'jewellery';
  }
  if (cat.description && cat.description.includes('<!--DEPT:ethnic-->')) {
    return 'ethnic';
  }
  const slug = (cat.slug || '').toLowerCase();
  const name = (cat.name || '').toLowerCase();
  if (JEWELLERY_KEYWORDS.some(k => slug.includes(k) || name.includes(k))) {
    return 'jewellery';
  }
  return 'ethnic';
}

function cleanDescription(desc) {
  if (!desc) return null;
  return desc.replace(/<!--DEPT:(jewellery|ethnic)-->/g, '').trim() || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dmpltyqedymhggdtexto.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

  const keyToUse = serviceRoleKey || publishableKey;
  const supabase = createClient(supabaseUrl, keyToUse);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const formatted = (data || []).map(cat => ({
        ...cat,
        department: detectDepartment(cat),
        description: cleanDescription(cat.description)
      }));

      return res.status(200).json({ success: true, categories: formatted });
    }

    if (req.method === 'POST') {
      const { name, slug, description, image_url, active, display_order, department } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category Name is required.' });
      }

      const rawSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', rawSlug)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: `This category slug '${rawSlug}' ('${existing.name}') already exists.` });
      }

      const deptToSet = department === 'jewellery' ? 'jewellery' : 'ethnic';
      let descWithTag = (description || '').trim();
      descWithTag = cleanDescription(descWithTag) || '';
      descWithTag = descWithTag ? `${descWithTag} <!--DEPT:${deptToSet}-->` : `<!--DEPT:${deptToSet}-->`;

      const payload = {
        name: name.trim(),
        slug: rawSlug,
        description: descWithTag,
        image_url: (image_url && image_url.trim()) ? image_url.trim() : null,
        active: active !== false,
        display_order: Number(display_order) || 0,
        department: deptToSet
      };

      // Try inserting with department column
      let { data, error } = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();

      if (error && error.message && error.message.includes('department')) {
        // Fallback if department column does not exist in DB schema yet
        delete payload.department;
        const retryRes = await supabase
          .from('categories')
          .insert([payload])
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error || !data) {
        console.error('Category insert error:', error);
        return res.status(500).json({ error: error ? error.message : 'Failed to insert category into database.' });
      }

      const returnedCat = {
        ...data,
        department: deptToSet,
        description: cleanDescription(data.description)
      };

      return res.status(200).json({ success: true, category: returnedCat });
    }

    if (req.method === 'PUT') {
      const { id, name, slug, description, image_url, active, display_order, department } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required for update.' });
      }

      const deptToSet = department ? (department === 'jewellery' ? 'jewellery' : 'ethnic') : undefined;

      const payload = {
        updated_at: new Date().toISOString()
      };

      if (name) payload.name = name.trim();
      if (slug) payload.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (image_url !== undefined) payload.image_url = (image_url && image_url.trim()) ? image_url.trim() : null;
      if (active !== undefined) payload.active = Boolean(active);
      if (display_order !== undefined) payload.display_order = Number(display_order);
      if (deptToSet) payload.department = deptToSet;

      if (description !== undefined || deptToSet !== undefined) {
        let baseDesc = description !== undefined ? description : '';
        baseDesc = cleanDescription(baseDesc) || '';
        if (deptToSet) {
          payload.description = baseDesc ? `${baseDesc} <!--DEPT:${deptToSet}-->` : `<!--DEPT:${deptToSet}-->`;
        } else if (description !== undefined) {
          payload.description = baseDesc || null;
        }
      }

      let { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error && error.message && error.message.includes('department')) {
        delete payload.department;
        const retryRes = await supabase
          .from('categories')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error || !data) {
        return res.status(500).json({ error: error ? error.message : 'Failed to update category.' });
      }

      const returnedCat = {
        ...data,
        department: deptToSet || detectDepartment(data),
        description: cleanDescription(data.description)
      };

      return res.status(200).json({ success: true, category: returnedCat });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Category ID is required for deletion.' });
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message || 'Failed to delete category.' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Admin Category API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
