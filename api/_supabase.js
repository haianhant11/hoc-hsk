/* Truy cập Supabase từ server (service role). Khóa chỉ nằm ở biến môi trường Vercel,
   không bao giờ xuống frontend. Trình duyệt không gọi Supabase trực tiếp. */
'use strict';

function configured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function headers() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
}

async function rpc(fn, args) {
  const r = await fetch(process.env.SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST', headers: headers(), body: JSON.stringify(args || {})
  });
  if (!r.ok) throw new Error('rpc ' + fn + ' -> ' + r.status);
  return r.json();
}

async function rest(path) {
  const r = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + path, { headers: headers() });
  if (!r.ok) throw new Error('rest ' + path + ' -> ' + r.status);
  return r.json();
}

function send(res, status, obj, cacheControl) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cacheControl || 'no-store');
  res.json(obj);
}

function guard(req, res, method) {
  if (!configured()) { send(res, 503, { error: 'not_configured' }); return false; }
  if (req.method !== method) { send(res, 405, { error: 'method_not_allowed' }); return false; }
  return true;
}

module.exports = { configured, rpc, rest, send, guard };
