/* POST /api/score — ghi nhận một lượt hoàn thành hợp lệ và cộng điểm.
   Body: {playerId, eventId, activityType, activityId, correct, total}
   Số điểm do SERVER tính từ bảng quy tắc (_policy); frontend không gửi được điểm tùy ý.
   Chống trùng: eventId duy nhất trong score_events, gửi lặp không cộng lần hai.
   Nguyên tử: hàm SQL khóa theo người chơi, xử lý đồng thời không sai tổng. */
'use strict';
const { rpc, send, guard } = require('./_supabase');
const { POLICY, computePoints, ACTIVITY_ID_RE, UUID_RE, EVENT_ID_RE } = require('./_policy');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'POST')) return;
  const b = req.body || {};
  if (!UUID_RE.test(b.playerId || '')) { send(res, 400, { error: 'invalid_player' }); return; }
  if (!EVENT_ID_RE.test(b.eventId || '')) { send(res, 400, { error: 'invalid_event' }); return; }
  if (!POLICY[b.activityType]) { send(res, 400, { error: 'invalid_type' }); return; }
  if (!ACTIVITY_ID_RE.test(b.activityId || '')) { send(res, 400, { error: 'invalid_activity' }); return; }
  const points = computePoints(b.activityType, b.correct, b.total);
  if (points === null) { send(res, 400, { error: 'invalid_result' }); return; }
  try {
    let rows;
    if (POLICY[b.activityType].mode === 'capped') {
      rows = await rpc('award_capped', {
        p_player: b.playerId, p_event: b.eventId, p_type: b.activityType,
        p_activity: b.activityId, p_points: points,
        p_group: b.activityId, p_cap: POLICY[b.activityType].dailyCap
      });
    } else {
      rows = await rpc('award_best', {
        p_player: b.playerId, p_event: b.eventId, p_type: b.activityType,
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
