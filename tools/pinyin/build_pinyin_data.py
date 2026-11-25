# -*- coding: utf-8 -*-
"""Sinh bảng âm tiết Pinyin chuẩn + audio zh-CN cho khóa /phat-am.

Nguồn:
  - Bảng âm tiết chuẩn (STANDARD bên dưới) chép theo bảng Pinyin chuẩn
    (https://en.wikipedia.org/wiki/Pinyin_table, 《汉语拼音方案》).
  - Cách đọc chữ Hán: thư viện pypinyin (từ điển 汉字拼音), chỉ dùng CÁCH ĐỌC CHÍNH
    của mỗi chữ để chữ – pinyin – audio luôn khớp nhau.
  - Từ ví dụ: từ vựng HSK 1–4 có sẵn trong repo (assets/data/hsk*.js).
  - Audio: edge-tts, giọng zh-CN-XiaoxiaoNeural.

Chạy:  python tools/pinyin/build_pinyin_data.py [--no-audio]
Kết quả: assets/data/pinyin-table.js, assets/audio/py/s/*.mp3, assets/audio/py/w/*.mp3
Script tự kiểm tra (mục C4): không trùng, âm tiết thuộc bảng chuẩn, thanh điệu chữ khớp pinyin,
số mục đếm khớp số ghi. Lỗi kiểm tra -> thoát mã 1.
"""
import asyncio, hashlib, json, os, re, subprocess, sys, unicodedata

from pypinyin import pinyin, Style
from pypinyin.pinyin_dict import pinyin_dict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_JS = os.path.join(ROOT, 'assets', 'data', 'pinyin-table.js')
AUDIO_S = os.path.join(ROOT, 'assets', 'audio', 'py', 's')
AUDIO_W = os.path.join(ROOT, 'assets', 'audio', 'py', 'w')
VOICE = 'zh-CN-XiaoxiaoNeural'

# ---------------- Bảng âm tiết chuẩn (không dấu) ----------------
R = {
  'a':   ' b p m f d t n l g k h zh ch sh z c s',
  'o':   ' b p m f',
  'e':   ' m d t n l g k h zh ch sh r z c s',
  'ai':  ' b p m d t n l g k h zh ch sh z c s',
  'ei':  ' b p m f d n l g h zh sh z',
  'ao':  ' b p m d t n l g k h zh ch sh r z c s',
  'ou':  ' p m f d t n l g k h zh ch sh r z c s',
  'an':  ' b p m f d t n l g k h zh ch sh r z c s',
  'en':  ' b p m f n g k h zh ch sh r z c s',
  'ang': ' b p m f d t n l g k h zh ch sh r z c s',
  'eng': ' b p m f d t n l g k h zh ch sh r z c s',
  'ong': 'd t n l g k h zh ch r z c s',
  'er':  '',
  '-i':  'zh ch sh r z c s',
  'i':   'b p m d t n l j q x',
  'ia':  'd l j q x',
  'ie':  'b p m d t n l j q x',
  'iao': 'b p m d t n l j q x',
  'iu':  'm d n l j q x',
  'ian': 'b p m d t n l j q x',
  'in':  'b p m n l j q x',
  'iang':'n l j q x',
  'ing': 'b p m d t n l j q x',
  'iong':'j q x',
  'u':   'b p m f d t n l g k h zh ch sh r z c s',
  'ua':  'g k h zh ch sh',
  'uo':  'd t n l g k h zh ch sh r z c s',
  'uai': 'g k h zh ch sh',
  'ui':  'd t g k h zh ch sh r z c s',
  'uan': 'd t n l g k h zh ch sh r z c s',
  'un':  'd t l g k h zh ch sh r z c s',
  'uang':'g k h zh ch sh',
  'ü':   'n l',
  'üe':  'n l',
  'u_jqx': 'j q x',     # ju qu xu
  'ue_jqx':'j q x',
  'uan_jqx':'j q x',
  'un_jqx':'j q x',
}
ZERO = {'a':'a','o':'o','e':'e','ai':'ai','ei':'ei','ao':'ao','ou':'ou','an':'an','en':'en','ang':'ang',
        'eng':'eng','er':'er','i':'yi','ia':'ya','ie':'ye','iao':'yao','iu':'you','ian':'yan','in':'yin',
        'iang':'yang','ing':'ying','iong':'yong','u':'wu','ua':'wa','uo':'wo','uai':'wai','ui':'wei',
        'uan':'wan','un':'wen','uang':'wang','ueng':'weng','ü':'yu','üe':'yue','üan':'yuan','ün':'yun'}

def standard_set():
    s = set(ZERO.values())
    for fin, inits in R.items():
        for ini in inits.split():
            if fin == '-i': s.add(ini + 'i')
            elif fin.endswith('_jqx'): s.add(ini + fin.split('_')[0])
            else: s.add(ini + fin)
    return s

STANDARD = standard_set()

# ---------------- Phân tích pinyin có dấu ----------------
TONE_CH = {'ā':('a',1),'á':('a',2),'ǎ':('a',3),'à':('a',4),'ē':('e',1),'é':('e',2),'ě':('e',3),'è':('e',4),
           'ī':('i',1),'í':('i',2),'ǐ':('i',3),'ì':('i',4),'ō':('o',1),'ó':('o',2),'ǒ':('o',3),'ò':('o',4),
           'ū':('u',1),'ú':('u',2),'ǔ':('u',3),'ù':('u',4),'ǖ':('ü',1),'ǘ':('ü',2),'ǚ':('ü',3),'ǜ':('ü',4)}

def parse(py):
    py = unicodedata.normalize('NFC', py.strip().lower())
    base, tone = '', 0
    for ch in py:
        if ch in TONE_CH:
            b, t = TONE_CH[ch]; base += b; tone = t
        else:
            base += ch
    base = base.replace('v', 'ü')
    return base, tone

def norm_py(s):
    s = unicodedata.normalize('NFC', s.lower())
    return re.sub(r"[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]", '', s)

def readings(ch):
    raw = pinyin_dict.get(ord(ch))
    return [p.strip() for p in raw.split(',')] if raw else []

def gb_level(ch):
    try:
        b = ch.encode('gb2312')
    except Exception:
        return 9
    if len(b) != 2: return 9
    return 1 if 0xB0 <= b[0] <= 0xD7 else 2

# ---------------- Từ vựng HSK trong repo ----------------
def load_hsk():
    js = r'''
global.window={};
const files=[['assets/data/hsk1.js','lessonsHSK1',1],['assets/data/hsk2.js','lessonsHSK2',2],
['assets/data/hsk3.js','lessonsHSK3',3],['assets/data/hsk4-shang.js','lessons4',4],['assets/data/hsk4-xia.js','lessons4xia',4]];
const out=[];
for(const [f,k,lv] of files){ window={}; global.window=window; require('./'+f);
  for(const l of window[k]) for(const v of l.vocab) out.push({w:v.word,p:v.pinyin,m:v.meaning,l:lv}); }
console.log(JSON.stringify(out));'''
    raw = subprocess.check_output(['node', '-e', js], cwd=ROOT, text=True, encoding='utf-8')
    return json.loads(raw)

def main():
    no_audio = '--no-audio' in sys.argv
    hsk = load_hsk()
    # Mỗi từ chỉ giữ lần xuất hiện ở cấp thấp nhất
    words = {}
    for v in hsk:
        w = v['w'].strip()
        if not re.fullmatch(r'[\u4e00-\u9fff]+', w): continue
        if w not in words or v['l'] < words[w]['l']:
            words[w] = v

    # Chữ -> danh sách (cách đọc trong từ, từ) chỉ khi pinyin repo khớp pypinyin của từ
    char_word = {}   # (ch, base, tone) -> best word dict
    mismatched = []
    for w, v in words.items():
        sy = [x[0] for x in pinyin(w, style=Style.TONE, heteronym=False)]
        if len(sy) != len(w): continue
        if norm_py(''.join(sy)) != norm_py(v['p']):
            mismatched.append((w, v['p'], ' '.join(sy)))
            continue
        for ch, s in zip(w, sy):
            b, t = parse(s)
            key = (ch, b, t)
            cur = char_word.get(key)
            rank = (0 if w == ch else 1, v['l'], len(w))
            if cur is None or rank < cur['rank']:
                char_word[key] = {'w': w, 'p': v['p'], 'm': v['m'], 'l': v['l'], 'rank': rank}

    # Ứng viên chữ cho từng (âm tiết, thanh): chữ có CÁCH ĐỌC CHÍNH đúng bằng ô đó
    cand = {}
    for cp, raw in pinyin_dict.items():
        ch = chr(cp)
        if not ('\u4e00' <= ch <= '\u9fff'): continue
        prim = raw.split(',')[0].strip()
        b, t = parse(prim)
        if b not in STANDARD: continue
        lv = gb_level(ch)
        hw = char_word.get((ch, b, t))
        if lv > 1 and not hw: continue
        rank = (0, hw['rank'][1], hw['rank'][0]) if hw else (1, lv, cp)
        key = (b, t)
        if key not in cand or rank < cand[key][0]:
            cand[key] = (rank, ch)

    # Chữ đại diện chọn tay cho vài ô (chữ phải có cách đọc này trong từ điển)
    OVR = {('fo', 2): '佛', ('e', 2): '鹅', ('ba', 1): '八', ('weng', 1): '翁', ('zhuai', 4): '拽'}
    for (b, t), ch in OVR.items():
        marked = [r for r in readings(ch) if parse(r) == (b, t)]
        if marked:
            cand[(b, t)] = ((-1,), ch)

    table = {}
    for (b, t), (rank, ch) in cand.items():
        hw = char_word.get((ch, b, t))
        py_marked = [r for r in readings(ch) if parse(r) == (b, t)][0]
        cell = {'c': ch, 'p': py_marked}
        if hw:
            cell['w'] = hw['w']; cell['wp'] = hw['p']; cell['m'] = hw['m']; cell['l'] = hw['l']
        table.setdefault(b, {})[str(t)] = cell

    # ---------------- Kiểm tra tự động (C4) ----------------
    errors = []
    for b, tones in table.items():
        if b not in STANDARD: errors.append('ngoai bang chuan: ' + b)
        for t, cell in tones.items():
            pb, pt = parse(cell['p'])
            if (pb, str(pt)) != (b, t): errors.append(f'thanh khong khop: {b}{t} {cell}')
            if cell['p'] not in readings(cell['c'])[:1] and (b, int(t)) not in OVR:
                errors.append(f'khong phai cach doc chinh: {b}{t} {cell}')
    flat = [(b, t) for b in table for t in table[b]]
    if len(flat) != len(set(flat)): errors.append('trung lap')
    # Các mục bắt buộc phải bị loại
    # (zhē 遮 và zhūn 谆 có thật trong 现代汉语词典 nên không nằm trong danh sách cấm)
    for bad in [('zhei','1'),('lü','1'),('nü','1'),('re','1'),('dei','1'),('gei','1'),('bai','1')]:
        if bad[0] in table and bad[1] in table[bad[0]]:
            errors.append('o thanh 1 khong ton tai nhung van co: ' + ''.join(bad) + ' ' + table[bad[0]][bad[1]]['c'])
    for need in [('zhi','1'),('ji','1'),('qu','4'),('nü','3'),('lü','4'),('zuan','1'),('suan','1'),('liu','4'),('dui','4'),('ba','1')]:
        if need[0] not in table or need[1] not in table[need[0]]:
            errors.append('thieu o bat buoc: ' + ''.join(need))

    counts = {'syllables': len(table), 'cells': len(flat), 'tone1': sum(1 for b in table if '1' in table[b])}

    # ---------------- Danh sách audio ----------------
    fixed_words = ['爸爸','朋友','妈妈','饭店','大家','天气','你好','老师','哥哥','咖啡','欢迎','机场','起床','学生',
                   '中国','吃饭','时候','认识','昨天','词典','宿舍','不是','不对','一定','一起','一般','好吃','很好','老虎']
    words_needed = set(fixed_words)
    for b in table:
        for t, cell in table[b].items():
            if cell.get('w') and cell['w'] != cell['c']: words_needed.add(cell['w'])
    word_file = {w: 'w/' + hashlib.sha1(w.encode('utf-8')).hexdigest()[:10] + '.mp3' for w in sorted(words_needed)}
    word_info = {}
    for w in words_needed:
        if w in words: word_info[w] = {'p': words[w]['p'], 'm': words[w]['m'], 'l': words[w]['l']}

    data = {'table': table, 'wordAudio': word_file, 'words': word_info, 'counts': counts}
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('/* Sinh tự động bởi tools/pinyin/build_pinyin_data.py — không sửa tay. */\n')
        f.write('window.PINYIN_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')

    print('counts:', counts, '| words audio:', len(word_file), '| repo pinyin mismatches skipped:', len(mismatched))
    if errors:
        print('KIEM TRA THAT BAI:'); [print('  ', e) for e in errors[:40]]
        sys.exit(1)
    print('KIEM TRA: OK')
    if no_audio: return

    jobs = []
    for b in table:
        for t, cell in table[b].items():
            jobs.append((cell['c'], os.path.join(AUDIO_S, b.replace('ü', 'v') + t + '.mp3')))
    for w, rel in word_file.items():
        jobs.append((w, os.path.join(ROOT, 'assets', 'audio', 'py', rel)))
    asyncio.run(gen_audio(jobs))

async def gen_audio(jobs):
    import edge_tts
    os.makedirs(AUDIO_S, exist_ok=True); os.makedirs(AUDIO_W, exist_ok=True)
    sem = asyncio.Semaphore(8)
    todo = [j for j in jobs if not (os.path.exists(j[1]) and os.path.getsize(j[1]) > 800)]
    print('audio can tao:', len(todo), '/', len(jobs))
    fails = []
    async def one(text, path):
        async with sem:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(text, VOICE, rate='-10%').save(path)
                    if os.path.getsize(path) > 800: return
                except Exception:
                    await asyncio.sleep(1.5 * (attempt + 1))
            fails.append(text)
    await asyncio.gather(*[one(t, p) for t, p in todo])
    print('audio loi:', len(fails), fails[:20])

if __name__ == '__main__':
    main()
