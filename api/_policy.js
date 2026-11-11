/* Bảng quy tắc điểm THỐNG NHẤT cho Bảng xếp hạng.
   Frontend chỉ gửi kết quả thô (số đúng / tổng số); số điểm luôn do server tính ở đây.
   - practice / quiz / srs: tối đa 30 điểm theo tỉ lệ đúng, cộng theo cơ chế "kỷ lục bài"
     (chỉ thưởng phần vượt điểm cao nhất từng đạt của chính bài đó, chống farm).
   - game: tối đa 20 điểm/ván theo tỉ lệ đúng, trần 40 điểm cho mỗi game mỗi ngày. */
'use strict';

const POLICY = {
  practice: { max: 30, mode: 'best' },
  quiz: { max: 30, mode: 'best' },
  srs: { max: 30, mode: 'best' },
  write: { max: 3, mode: 'best', dbType: 'practice' },
  game: { max: 20, mode: 'capped', dailyCap: 40 }
};

function computePoints(activityType, correct, total) {
  const rule = POLICY[activityType];
  if (!rule) return null;
  if (typeof correct !== 'number' || typeof total !== 'number') return null;
  if (!Number.isFinite(correct) || !Number.isFinite(total)) return null;
  if (total < 1 || total > 500 || correct < 0 || correct > total) return null;
  return Math.round(rule.max * correct / total);
}

/* Chuẩn hóa tên hiển thị: gộp khoảng trắng, bỏ ký tự điều khiển và < > (chống HTML/script),
   giới hạn 2–40 ký tự. normalized = viết thường, dùng làm khóa duy nhất của hồ sơ. */
function normalizeName(raw) {
  if (typeof raw !== 'string') return null;
  const display = raw.replace(/[<>\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (display.length < 2 || display.length > 40) return null;
  return { display: display, normalized: display.toLowerCase() };
}

const ACTIVITY_ID_RE = /^[a-z0-9][a-z0-9:_-]{0,79}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_ID_RE = /^[a-zA-Z0-9-]{8,80}$/;

module.exports = { POLICY, computePoints, normalizeName, ACTIVITY_ID_RE, UUID_RE, EVENT_ID_RE };
