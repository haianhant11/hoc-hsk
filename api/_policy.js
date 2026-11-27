/* Bảng quy tắc điểm THỐNG NHẤT cho Bảng xếp hạng.
   Frontend chỉ gửi kết quả thô (số đúng / tổng số); số điểm luôn do server tính ở đây.
   - practice / quiz / srs: tối đa 30 điểm theo tỉ lệ đúng, cộng theo cơ chế "kỷ lục bài"
     (chỉ thưởng phần vượt điểm cao nhất từng đạt của chính bài đó, chống farm).
   - game: tối đa 20 điểm/ván theo tỉ lệ đúng, trần 200 điểm cho mỗi game mỗi ngày.
   FIX 3 (ii): activityId phải khớp whitelist theo từng activityType (isValidActivityId).
   Trước đây chỉ kiểm tra định dạng chung nên attacker bịa activityId mới là có thêm
   một "bài" mới với kỷ lục riêng, mỗi cái cộng tới 30 điểm. Giờ chỉ các dạng thật
   mà frontend gửi mới được chấp nhận; dạng nào không khớp thì 400 invalid_activity.
   FIX 3 (iii): đã XÓA rule 'write' khỏi POLICY (không caller nào gửi activityType
   'write'; bài tập viết đi qua type 'practice' với id 'write:<course>:<num>:<vi>'). */
'use strict';

const POLICY = {
  practice: { max: 30, mode: 'best' },
  quiz: { max: 30, mode: 'best' },
  srs: { max: 30, mode: 'best' },
  grammar: { max: 20, mode: 'best', dbType: 'practice' },
  game: { max: 20, mode: 'capped', dailyCap: 200 }
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

/* Whitelist activityId (FIX 3 ii). Mọi dạng dưới đây đều đã đối chiếu với từng
   LB.award(...) thật trong assets/ (xem chú thích từng nhóm). Số bài (num) để 1-99
   cho rộng, ngày để dạng YYYY-MM-DD theo múi giờ Asia/Ho_Chi_Minh của todayKey().
   - practice: dictation/fill theo bài (engine.js:183 lbPracticeCheck),
     write theo từng từ vựng (engine.js:268, vi = chỉ số từ trong bài).
   - quiz: trắc nghiệm đọc hiểu theo bài (engine.js:184 lbQuizCheck).
   - srs: phiên ôn SRS theo ngày (assets/srs-page.js:176) và ôn tập tự chọn
     /on-tap theo ngày (assets/custom-review.js:959). Cả hai đều gửi type 'srs'.
   - grammar: bài tập đặt câu, gi = chỉ số chủ điểm trong bài, pi = 0/1
     (engine.js:1105 submitGrammarPractice qua grKey ở engine.js:329).
   - game: đúng 5 game có thật (engine.js:459 game-fall, :639 game-tower,
     :1038 game-cannon, :1049 game-tone, :1080 game-karaoke). Không có game nào
     khác; thêm game mới ở frontend thì PHẢI thêm tên vào đây trước khi live.
   Không có dạng nào khác được chấp nhận. */
const COURSE_RE = '(?:hsk1|hsk2|hsk3|hsk4-thuong|hsk4-ha)';
const NUM_RE = '(?:[1-9][0-9]?)';
const DATE_RE = '(?:\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01]))';
const ACTIVITY_PATTERNS = {
  practice: [
    new RegExp('^(?:dictation|fill):' + COURSE_RE + ':' + NUM_RE + '$'),
    new RegExp('^write:' + COURSE_RE + ':' + NUM_RE + ':\\d{1,3}$')
  ],
  quiz: [
    new RegExp('^quiz:' + COURSE_RE + ':' + NUM_RE + '$')
  ],
  srs: [
    new RegExp('^srs:' + DATE_RE + '$'),
    new RegExp('^custom-review:' + DATE_RE + '$')
  ],
  grammar: [
    new RegExp('^grammar:' + COURSE_RE + ':' + NUM_RE + ':\\d{1,2}:\\d$')
  ],
  game: [
    new RegExp('^game-(?:fall|tower|cannon|tone|karaoke)$')
  ]
};

function isValidActivityId(activityType, activityId) {
  if (typeof activityId !== 'string') return false;
  const pats = ACTIVITY_PATTERNS[activityType];
  if (!pats) return false;
  for (let i = 0; i < pats.length; i++) {
    if (pats[i].test(activityId)) return true;
  }
  return false;
}

/* Chỉ kiểm tra định dạng chung, KHÔNG đủ để chấp nhận một activityId.
   Giữ lại để tương thích, nhưng score.js phải dùng isValidActivityId. */
const ACTIVITY_ID_RE = /^[a-z0-9][a-z0-9:_-]{0,79}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_ID_RE = /^[a-zA-Z0-9-]{8,80}$/;

module.exports = { POLICY, computePoints, normalizeName, ACTIVITY_ID_RE, UUID_RE, EVENT_ID_RE, isValidActivityId, ACTIVITY_PATTERNS };
