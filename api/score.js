/* POST /api/score, ghi nhận một lượt hoàn thành hợp lệ và cộng điểm.
   Body: {playerId, eventId, activityType, activityId, correct, total[, token]}
   Số điểm do SERVER tính từ bảng quy tắc (_policy); frontend không gửi được điểm tùy ý.
   Chống trùng: eventId duy nhất trong score_events, gửi lặp không cộng lần hai.
   Nguyên tử: hàm SQL khóa theo người chơi, xử lý đồng thời không sai tổng.
   FIX 3 (ii): activityId phải khớp whitelist theo activityType (isValidActivityId),
   bịa id mới không còn tạo được "bài" mới để farm điểm.
   FIX 3 (iv): khi LB_TOKEN_ENFORCE=1, người chơi có dấu token_created_at phải
   gửi đúng token HMAC (thiếu: 401 missing_token, sai: 403 invalid_token);
   người chơi cũ không có dấu được grandfathered và vẫn cộng điểm bình thường. */
'use strict';
const { rpc, send, guard } = require('./_supabase');
const { POLICY, computePoints, isValidActivityId, UUID_RE, EVENT_ID_RE } = require('./_policy');
const { checkToken } = require('./_token');
const { checkRateLimit } = require('./_ratelimit');

const TOKEN_STATUS = { missing_token: 401, invalid_token: 403, not_found: 404, token_check_unavailable: 503 };

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  if (!(await checkRateLimit(req, res, 'score'))) return;
  const b = req.body || {};
  if (!UUID_RE.test(b.playerId || '')) { send(res, 400, { error: 'invalid_player' }); return; }
  if (!EVENT_ID_RE.test(b.eventId || '')) { send(res, 400, { error: 'invalid_event' }); return; }
  if (!POLICY[b.activityType]) { send(res, 400, { error: 'invalid_type' }); return; }
  if (!isValidActivityId(b.activityType, b.activityId)) { send(res, 400, { error: 'invalid_activity' }); return; }
  const points = computePoints(b.activityType, b.correct, b.total);
  if (points === null) { send(res, 400, { error: 'invalid_result' }); return; }
  const tokenErr = await checkToken(b.playerId, b.token);
  if (tokenErr) { send(res, TOKEN_STATUS[tokenErr] || 503, { error: tokenErr }); return; }
  try {
    let rows;
    const dbType = POLICY[b.activityType].dbType || b.activityType;
    if (POLICY[b.activityType].mode === 'capped') {
      rows = await rpc('award_capped', {
        p_player: b.playerId, p_event: b.eventId, p_type: dbType,
        p_activity: b.activityId, p_points: points,
        p_group: b.activityId, p_cap: POLICY[b.activityType].dailyCap
      });
    } else {
      rows = await rpc('award_best', {
        p_player: b.playerId, p_event: b.eventId, p_type: dbType,
        p_activity: b.activityId, p_points: points
      });
    }
    const r = rows && rows[0];
    if (!r) { send(res, 502, { error: 'upstream' }); return; }
    send(res, 200, { awarded: r.awarded, total: r.total });
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
