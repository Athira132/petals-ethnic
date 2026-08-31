import dns from 'dns';

const host1 = 'giqngsukscyghqkitijc.supabase.co';
const host2 = 'giqngsukscyghqkjtijc.supabase.co';

dns.lookup(host1, (err, address) => {
  console.log(`Lookup ${host1}:`, err ? err.message : address);
});

dns.lookup(host2, (err, address) => {
  console.log(`Lookup ${host2}:`, err ? err.message : address);
});
