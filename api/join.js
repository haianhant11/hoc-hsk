/* POST /api/join {name}, tham gia hoặc khôi phục hồ sơ theo tên.
   Tên chưa có: tạo hồ sơ mới, tặng 20 điểm chào mừng đúng một lần (trong hàm SQL).
   Tên đã có: dùng chung hồ sơ và điểm hiện có, không tặng lại 20 điểm.
   Lưu ý: cơ chế này nhận hồ sơ bằng tên, KHÔNG xác thực danh tính người nhập.
   FIX 3 (iv): khi tạo MỚI (created=true) thì cấp token HMAC (xem api/_token.js)
   và đóng dấu token_created_at lên hàng players. Khi claim tên ĐÃ CÓ thì KHÔNG
   cấp token (cấp lúc đó token rò đúng như UUID). Token trả về trong `token`
   (null khi không cấp được, ví dụ chưa đặt LB_TOKEN_SECRET). Frontend phải lưu
   token cùng profile và gửi kèm trong /api/score và /api/rename. */
'use strict';
const { rpc, patch, send, guard } = require('./_supabase');
const { normalizeName } = require('./_policy');
const { issueToken } = require('./_token');
const { checkRateLimit } = require('./_ratelimit');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  if (!(await checkRateLimit(req, res, 'join'))) return;
  const body = req.body || {};
  const nm = normalizeName(body.name);
  if (!nm) { send(res, 400, { error: 'invalid_name' }); return; }
  try {
    const rows = await rpc('claim_player', { p_display: nm.display, p_normalized: nm.normalized });
    const p = rows && rows[0];
    if (!p) { send(res, 502, { error: 'upstream' }); return; }
    const rankRows = await rpc('player_rank', { p_id: p.id });
    const rk = rankRows && rankRows[0];
    let token = null;
    if (p.created) {
      token = issueToken(p.id);
      if (token) {
        // Đóng dấu để score/rename phân biệt người chơi có token với người chơi
        // cũ được grandfathered. Best effort: cột có thể chưa tồn tại (chưa
        // chạy migration) và join không được phép hỏng vì chuyện đó.
        try {
          await patch('players?id=eq.' + encodeURIComponent(p.id), { token_created_at: new Date().toISOString() });
        } catch (e) { /* giữ nguyên: người chơi này coi như chưa được đóng dấu */ }
      }
    }
    send(res, 200, {
      id: p.id, name: p.display_name, points: p.total_points, created: !!p.created,
      rank: rk ? Number(rk.rank) : null, totalPlayers: rk ? Number(rk.total_players) : null,
      token: token
    });
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
