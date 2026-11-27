/* GET /api/leaderboard, Top 10 toàn website, tính từ database thật.
   Thứ tự: điểm giảm dần, đạt điểm đó trước xếp trên, id ổn định làm tiêu chí cuối.
   FIX 3 (i): KHÔNG trả id nữa, chỉ rank/name/points. id vẫn dùng trong ORDER BY
   (tiêu chí cuối khi hòa điểm) nhưng không bao giờ rời khỏi server, vì UUID
   từng là chìa khóa duy nhất để cộng điểm / đổi tên hộ qua /api/score và
   /api/rename. Frontend phải so "Bạn" bằng tên chuẩn hóa thay vì me.id === p.id. */
'use strict';
const { rest, send, guard } = require('./_supabase');
const { checkRateLimit } = require('./_ratelimit');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'GET')) return;
  if (!(await checkRateLimit(req, res, 'leaderboard'))) return;
  try {
    const rows = await rest('players?select=id,display_name,total_points&order=total_points.desc,score_reached_at.asc,id.asc&limit=10');
    send(res, 200, {
      players: rows.map((p, i) => ({ rank: i + 1, name: p.display_name, points: p.total_points }))
    }, 'public, s-maxage=10, stale-while-revalidate=20');
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
