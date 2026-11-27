/* Per-player secret token (FIX 3 iv): HMAC-SHA256(LB_TOKEN_SECRET, playerId).
   Token = HMAC(secret, 'lb-token-v1:<playerId>'), hex. Không có thời hạn,
   không lưu trong DB; server tính lại để kiểm tra nên không cần tra cứu thêm.
   Secret CHỈ đọc từ biến môi trường Vercel LB_TOKEN_SECRET, không bao giờ
   hardcode, không sinh rồi ghi ra file.

   VÌ SAO KHÔNG CÓ TOKEN SẠCH CHO NGƯỜI CHƠI CŨ (bootstrap problem):
   - Thiết kế gốc là claim-by-name, không xác thực. Trình duyệt của chủ hồ sơ
     chỉ giữ {id, name} trong localStorage, đúng thứ mà /api/leaderboard và
     /api/join trả công khai, nên không có gì bí mật để làm gốc cho token cũ.
   - File notes/supabase-leaderboard.sql KHÔNG có schema thật (nội dung chỉ là
     "404: Not Found"), nên không có cột players.created_at hay dấu mốc tạo
     hồ sơ nào để dựa vào. Dấu hiệu tạo mới duy nhất là cờ `created` mà RPC
     claim_player trả về lúc join (join.js đã dùng p.created từ trước).
   - Vì vậy: token CHỈ cấp lúc tạo hồ sơ mới (join trả created=true), KHÔNG BAO
     GIỜ cấp khi claim tên đã có (cấp lúc đó thì token rò đúng như UUID).
     Lúc cấp, join.js đóng dấu token_created_at = now() lên hàng players đó.
   - Người chơi cũ (token_created_at NULL, hoặc cột chưa có vì chưa chạy
     migration) được GRANDFATHERED: score/rename không đòi token. Họ vẫn
     không được bảo vệ cho tới khi migration chạy và enforcement bật, và ngay
     cả sau đó họ vẫn không có token (xem notes/fix3-token-migration.sql).
   - Enforcement nằm sau cờ LB_TOKEN_ENFORCE=1, mặc định TẮT. Bật cờ trước khi
     chạy migration thì checkToken trả 503 token_check_unavailable (fail-closed)
     chứ không lặng lẽ bỏ qua. */
'use strict';
const crypto = require('crypto');
const { rest } = require('./_supabase');

const TOKEN_VERSION = 'lb-token-v1';

function tokenSecret() {
  return process.env.LB_TOKEN_SECRET || '';
}

function issueToken(playerId) {
  const secret = tokenSecret();
  if (!secret || !playerId) return null;
  return crypto.createHmac('sha256', secret).update(TOKEN_VERSION + ':' + playerId).digest('hex');
}

function verifyToken(playerId, token) {
  const secret = tokenSecret();
  if (!secret || !playerId || typeof token !== 'string' || !token) return false;
  const expected = issueToken(playerId);
  if (!expected) return false;
  const a = Buffer.from(token, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function tokenEnforcementEnabled() {
  return process.env.LB_TOKEN_ENFORCE === '1';
}

/* Người chơi cần token chỉ khi hàng của họ mang dấu token_created_at
   (được đóng dấu lúc tạo mới + cấp token). NULL hoặc thiếu cột = grandfathered. */
function playerNeedsToken(playerRow) {
  return !!(playerRow && playerRow.token_created_at);
}

/* Kiểm tra token cho score/rename. Trả null khi được phép tiếp tục, ngược lại
   trả mã lỗi: 'missing_token' (401), 'invalid_token' (403), 'not_found' (404),
   'token_check_unavailable' (503, ví dụ cột token_created_at chưa có vì chưa
   chạy migration mà enforcement đã bật). Khi cờ enforcement TẮT thì luôn trả
   null và không đọc DB thêm. */
async function checkToken(playerId, token) {
  if (!tokenEnforcementEnabled()) return null;
  let rows;
  try {
    rows = await rest('players?id=eq.' + encodeURIComponent(playerId) + '&select=id,token_created_at&limit=1');
  } catch (e) {
    return 'token_check_unavailable';
  }
  const row = rows && rows[0];
  if (!row) return 'not_found';
  if (!playerNeedsToken(row)) return null;
  if (!token) return 'missing_token';
  if (!verifyToken(playerId, token)) return 'invalid_token';
  return null;
}

module.exports = { TOKEN_VERSION, issueToken, verifyToken, tokenEnforcementEnabled, playerNeedsToken, checkToken };
