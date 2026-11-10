/* GET /api/leaderboard — Top 10 toàn website, tính từ database thật.
   Thứ tự: điểm giảm dần, đạt điểm đó trước xếp trên, id ổn định làm tiêu chí cuối. */
'use strict';
const { rest, send, guard } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (!guard(req, res, 'GET')) return;
  try {
    const rows = await rest('players?select=id,display_name,total_points&order=total_points.desc,score_reached_at.asc,id.asc&limit=10');
    send(res, 200, {
      players: rows.map((p, i) => ({ rank: i + 1, id: p.id, name: p.display_name, points: p.total_points }))
    });
  } catch (e) {
    send(res, 502, { error: 'upstream' });
  }
};
