import { createClient } from '@supabase/supabase-js';

const url = 'https://giqngsukscyghqkjtijc.supabase.co';
const key = 'sb_publishable_JHt31eRCBafVoRI-_LKswA_LZfAjyYr';

const supabase = createClient(url, key);

async function testSignIn() {
  // Check if profile exists
  const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('email', 'dhanyaadwork@gmail.com');
  console.log("PROFILE CHECK:", prof, profErr?.message);

  // Test sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dhanyaadwork@gmail.com',
    password: 'Dhanya@2026Password!'
  });

  if (error) {
    console.error("SIGNIN ERROR OBJECT:");
    console.dir(error, { depth: null });
  } else {
    console.log("SIGNIN SUCCESSFUL! User ID:", data.user.id);
  }
}

testSignIn();
