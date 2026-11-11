/* GET /api/me?id=<uuid> — hồ sơ hiện tại của người chơi trên server.
   Ngoài Top 10 vẫn trả rank thật nội bộ; giao diện hiển thị theo quy ước "#11 · Ngoài Top 10". */
'use strict';
const { rpc, rest, send, guard } = require('./_supabase');
const { UUID_RE } = require('./_policy');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'GET')) return;
  const id = (req.query && req.query.id) || '';
  if (!UUID_RE.test(id)) { send(res, 400, { error: 'invalid_id' }); return; }
  try {
    const rows = await rest('players?id=eq.' + encodeURIComponent(id) + '&select=id,display_name,total_points');
    if (!rows.length) { send(res, 404, { error: 'not_found' }); return; }
    const p = rows[0];
    const rankRows = await rpc('player_rank', { p_id: p.id });
    const rk = rankRows && rankRows[0];
    send(res, 200, {
      id: p.id, name: p.display_name, points: p.total_points,
      rank: rk ? Number(rk.rank) : null, totalPlayers: rk ? Number(rk.total_players) : null,
      inTop10: rk ? Number(rk.rank) <= 10 : false
    }, 'private, max-age=10, stale-while-revalidate=30');
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
