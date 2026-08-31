import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmpltyqedymhggdtexto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcGx0eXFlZHltaGdnZHRleHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODEzNzYsImV4cCI6MjEwMjM1NzM3Nn0.GvioERQdSKhoJEPj3-6WiOqCqaXDTGVtgDkvsVjnulk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Logging in as dhanyaadwork@gmail.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dhanyaadwork@gmail.com',
    password: 'Dhanya@2026'
  });

  if (error) {
    console.error('Login error:', error.message);
    return;
  }

  console.log('Login successful! User ID:', data.user.id);
  const token = data.session.access_token;
  console.log('Access token acquired.');

  const clientWithAuth = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  console.log('\nTesting query products with authenticated admin token...');
  const { data: prods, error: prodErr } = await clientWithAuth.from('products').select('*');
  if (prodErr) {
    console.error('Products query error:', prodErr);
  } else {
    console.log(`Success! Products returned: ${prods ? prods.length : 0}`);
    console.log('Sample product:', prods[0]);
  }
}

testAuth();
