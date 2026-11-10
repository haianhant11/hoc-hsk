/* POST /api/join {name} — tham gia hoặc khôi phục hồ sơ theo tên.
   Tên chưa có: tạo hồ sơ mới, tặng 20 điểm chào mừng đúng một lần (trong hàm SQL).
   Tên đã có: dùng chung hồ sơ và điểm hiện có, không tặng lại 20 điểm.
   Lưu ý: cơ chế này nhận hồ sơ bằng tên, KHÔNG xác thực danh tính người nhập. */
'use strict';
const { rpc, send, guard } = require('./_supabase');
const { normalizeName } = require('./_policy');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const body = req.body || {};
  const nm = normalizeName(body.name);
  if (!nm) { send(res, 400, { error: 'invalid_name' }); return; }
  try {
    const rows = await rpc('claim_player', { p_display: nm.display, p_normalized: nm.normalized });
    const p = rows && rows[0];
    if (!p) { send(res, 502, { error: 'upstream' }); return; }
    const rankRows = await rpc('player_rank', { p_id: p.id });
    const rk = rankRows && rankRows[0];
    send(res, 200, {
      id: p.id, name: p.display_name, points: p.total_points, created: !!p.created,
      rank: rk ? Number(rk.rank) : null, totalPlayers: rk ? Number(rk.total_players) : null
    });
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
