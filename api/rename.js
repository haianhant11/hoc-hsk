/* POST /api/rename {playerId, name} — đổi tên hiển thị của hồ sơ hiện tại trong database.
   Giữ nguyên UUID và toàn bộ điểm hiện có; từ chối (409) nếu tên mới đã thuộc về người chơi khác. */
'use strict';
const { rpc, rest, patch, send, guard } = require('./_supabase');
const { normalizeName, UUID_RE } = require('./_policy');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const b = req.body || {};
  if (!UUID_RE.test(b.playerId || '')) { send(res, 400, { error: 'invalid_player' }); return; }
  const nm = normalizeName(b.name);
  if (!nm) { send(res, 400, { error: 'invalid_name' }); return; }

  try {
    const existing = await rest('players?id=eq.' + encodeURIComponent(b.playerId) + '&select=*&limit=1');
    if (!existing || !existing.length) { send(res, 404, { error: 'not_found' }); return; }
    const current = existing[0];

    const normCol = Object.prototype.hasOwnProperty.call(current, 'normalized_name')
      ? 'normalized_name'
      : (Object.prototype.hasOwnProperty.call(current, 'normalized') ? 'normalized' : null);

    if (normCol) {
      const dup = await rest(
        'players?id=neq.' + encodeURIComponent(b.playerId) +
        '&' + normCol + '=eq.' + encodeURIComponent(nm.normalized) +
        '&select=id&limit=1'
      );
      if (dup && dup.length) { send(res, 409, { error: 'name_taken' }); return; }
    }

    const payload = { display_name: nm.display };
    if (normCol) payload[normCol] = nm.normalized;

    const updatedRows = await patch('players?id=eq.' + encodeURIComponent(b.playerId), payload);
    const p = updatedRows && updatedRows[0];
    if (!p) { send(res, 502, { error: 'upstream' }); return; }

    const rankRows = await rpc('player_rank', { p_id: p.id });
    const rk = rankRows && rankRows[0];
    send(res, 200, {
      id: p.id,
      name: p.display_name,
      points: p.total_points,
      rank: rk ? Number(rk.rank) : null,
      totalPlayers: rk ? Number(rk.total_players) : null
    });
  } catch (e) {
    if (e && e.status === 409) { send(res, 409, { error: 'name_taken' }); return; }
    send(res, 502, { error: 'upstream' });
  }
};
