/* Dữ liệu khóa Phát âm chuẩn Pinyin: Thanh mẫu, Vận mẫu, Thanh điệu & Bảng ghép âm hợp lệ */
window.PINYIN_INITIALS = [
  {
    id: 'bilabial',
    name: 'Nhóm âm hai môi (双唇音)',
    diagram: 'bilabial',
    tip: 'Hai môi khép kín hoàn toàn để chặn hơi, sau đó mở nhanh.',
    items: [
      { sym: 'b', read: 'bō', han: '波', vi: 'pua / bô (không bật hơi)', air: 'Không bật hơi', mouth: 'Hai môi mím chặt, rồi mở nhẹ cho hơi thoát ra tự nhiên, dây thanh không rung (gần như chữ "p" không bật hơi, nhẹ hơn chữ "b" tiếng Việt).', mistake: 'Hay đọc rung dây thanh như "bờ" tiếng Việt.' },
      { sym: 'p', read: 'pō', han: '坡', vi: 'phua / pô (bật hơi mạnh)', air: 'Bật hơi mạnh', mouth: 'Hai môi mím chặt tích hơi, sau đó bật bung ra thật mạnh (đặt tờ giấy trước miệng sẽ thấy giấy bay rõ).', mistake: 'Hay bật hơi quá nhẹ giống âm "b".' },
      { sym: 'm', read: 'mō', han: '摸', vi: 'mua / mô (âm mũi)', air: 'Ra khoang mũi', mouth: 'Hai môi khép kín, ngạc mềm hạ xuống để luồng hơi đi qua khoang mũi, dây thanh rung.', mistake: 'Gần giống chữ "m" tiếng Việt, cần giữ môi khép trọn lúc đầu.' }
    ]
  },
  {
    id: 'labiodental',
    name: 'Nhóm âm môi răng (唇齿音)',
    diagram: 'labiodental',
    tip: 'Răng cửa hàm trên chạm nhẹ vào mép trong môi dưới.',
    items: [
      { sym: 'f', read: 'fō', han: '佛', vi: 'fua / phô (xát nhẹ)', air: 'Xát liên tục', mouth: 'Răng trên chạm nhẹ môi dưới, tạo khe hở nhỏ để luồng hơi xát nhẹ đi ra (giống âm "ph" tiếng Việt nhưng gọn và không bật hơi).', mistake: 'Tránh bặm hai môi giống "p".' }
    ]
  },
  {
    id: 'alveolar',
    name: 'Nhóm âm đầu lưỡi giữa (舌尖中音)',
    diagram: 'alveolar',
    tip: 'Đầu lưỡi nâng lên chạm vào phần lợi (nướu) ngay sau răng cửa trên.',
    items: [
      { sym: 'd', read: 'dē', han: '得', vi: 'tơ (không bật hơi)', air: 'Không bật hơi', mouth: 'Đầu lưỡi ấn vào lợi trên chặn hơi, rồi hạ xuống nhẹ nhàng không bật hơi mạnh (nghe gần giống "t" nhẹ trong tiếng Việt).', mistake: 'Hay đọc nặng thành "đ" tiếng Việt.' },
      { sym: 't', read: 'tē', han: '特', vi: 'thơ (bật hơi mạnh)', air: 'Bật hơi mạnh', mouth: 'Đầu lưỡi đặt cùng vị trí như "d" (chạm lợi trên), tích hơi rồi bật mạnh ra ngoài (giống "th" tiếng Việt nhưng hơi bật dứt khoát hơn).', mistake: 'Thiếu luồng hơi bật mạnh ở đầu âm.' },
      { sym: 'n', read: 'nē', han: '呢', vi: 'nơ (âm mũi)', air: 'Ra khoang mũi', mouth: 'Đầu lưỡi chạm lợi trên chặn đường miệng, hơi thoát hoàn toàn qua khoang mũi, dây thanh rung.', mistake: 'Hay bị ngọng sang "l" ở một số vùng.' },
      { sym: 'l', read: 'lē', han: '乐', vi: 'lơ (âm bên)', air: 'Thoát hai bên lưỡi', mouth: 'Đầu lưỡi chạm lợi trên (nhưng hẹp hơn "n"), luồng hơi đi vòng qua hai bên rìa lưỡi thoát ra ngoài.', mistake: 'Cần giữ đầu lưỡi cố định trên lợi trước khi buông.' }
    ]
  },
  {
    id: 'velar',
    name: 'Nhóm âm cuống lưỡi (舌根音)',
    diagram: 'velar',
    tip: 'Cuống lưỡi (phần gốc lưỡi phía sau) nâng lên chạm hoặc sát ngạc mềm.',
    items: [
      { sym: 'g', read: 'gē', han: '哥', vi: 'cơ (không bật hơi)', air: 'Không bật hơi', mouth: 'Cuống lưỡi nâng chạm ngạc mềm, rồi hạ xuống nhẹ nhàng (giống "c/k" nhẹ trong tiếng Việt, không rung cổ họng như "g").', mistake: 'Hay đọc nhầm thành "gờ" tiếng Việt.' },
      { sym: 'k', read: 'kē', han: '科', vi: 'khơ (bật hơi mạnh)', air: 'Bật hơi mạnh', mouth: 'Cuống lưỡi chạm ngạc mềm như "g", tích hơi rồi bật mạnh ra ngoài (giống "kh" nhưng bật từ cuống lưỡi sâu hơn).', mistake: 'Bật hơi yếu hoặc đọc xát quá giống "h".' },
      { sym: 'h', read: 'hē', han: '喝', vi: 'hơ (xát cuống lưỡi)', air: 'Xát ở họng', mouth: 'Cuống lưỡi nâng gần sát ngạc mềm tạo khe hẹp, hơi đi qua khe này tạo tiếng xát nhẹ (nặng hơn "h" tiếng Việt một chút, hơi gần "kh" nhẹ).', mistake: 'Đọc quá nhẹ như "h" tiếng Việt.' }
    ]
  },
  {
    id: 'palatal',
    name: 'Nhóm âm mặt lưỡi (舌面音)',
    diagram: 'palatal',
    tip: 'Đầu lưỡi tì nhẹ sau răng cửa dưới, mặt lưỡi trước nâng lên sát ngạc cứng.',
    items: [
      { sym: 'j', read: 'jī', han: '鸡', vi: 'chi (không bật hơi)', air: 'Không bật hơi', mouth: 'Đầu lưỡi đặt sau răng dưới, mặt lưỡi áp sát ngạc cứng, kéo khóe miệng hơi dẹt sang hai bên như cười nhẹ rồi mở khe cho hơi ra nhẹ (gần "ch" nhưng mỏng và dẹt).', mistake: 'Hay cong lưỡi hoặc đọc thành "gi" tiếng Việt.' },
      { sym: 'q', read: 'qī', han: '七', vi: 'xi/chi (bật hơi mạnh)', air: 'Bật hơi mạnh', mouth: 'Vị trí lưỡi giống hệt "j" (đầu lưỡi sau răng dưới, mặt lưỡi ép ngạc cứng), nhưng bật mạnh luồng hơi ra ngoài.', mistake: 'Hay quên bật hơi hoặc phát âm thành "k/c".' },
      { sym: 'x', read: 'xī', han: '西', vi: 'xi (xát mặt lưỡi)', air: 'Xát nhẹ', mouth: 'Đầu lưỡi đặt sau răng dưới, mặt lưỡi nâng gần ngạc cứng tạo khe hở nhỏ, luồng hơi xát nhẹ thoát ra (giống "x" tiếng Việt nhưng mặt lưỡi nâng cao hơn).', mistake: 'Đọc nặng thành "s" uốn lưỡi.' }
    ]
  },
  {
    id: 'retroflex',
    name: 'Nhóm âm uốn lưỡi / đầu lưỡi sau (翘舌音)',
    diagram: 'retroflex',
    tip: 'Đầu lưỡi cong (uốn) nhẹ lên chạm phần trước ngạc cứng (phía sau lợi).',
    items: [
      { sym: 'zh', read: 'zhī', han: '知', vi: 'trư (uốn lưỡi, không bật hơi)', air: 'Không bật hơi', mouth: 'Đầu lưỡi cong lên chạm vào phía sau lợi (trước ngạc cứng), không bật hơi, hơi mở khe cho âm thoát ra.', mistake: 'Hay quên uốn lưỡi nên lẫn với "z" hoặc đọc thành "gi".' },
      { sym: 'ch', read: 'chī', han: '吃', vi: 'trư (uốn lưỡi, bật hơi mạnh)', air: 'Bật hơi mạnh', mouth: 'Đầu lưỡi uốn lên chạm cùng vị trí với "zh", tích hơi rồi bật mạnh luồng hơi ra ngoài.', mistake: 'Đọc giống "ch" tiếng Việt (không uốn lưỡi, không bật hơi).' },
      { sym: 'sh', read: 'shī', han: '诗', vi: 'sư (uốn lưỡi, xát)', air: 'Xát liên tục', mouth: 'Đầu lưỡi uốn cong lên gần phần trước ngạc cứng (không chạm hẳn), để lại khe hở cho hơi xát đều ra ngoài (gần "s" nặng miền Trung/Nam).', mistake: 'Quên uốn lưỡi nên bị lẫn sang "x" hoặc "s".' },
      { sym: 'r', read: 'rī', han: '日', vi: 'rư (uốn lưỡi, hữu thanh)', air: 'Xát + rung thanh', mouth: 'Đầu lưỡi uốn cong như "sh", nhưng dây thanh rung nhẹ, luồng hơi đi qua khe hẹp tạo âm êm (không rung đầu lưỡi liên hồi như "r" tiếng Nga/Tây Ban Nha).', mistake: 'Đọc thành "d" hoặc "gi" miền Bắc.' }
    ]
  },
  {
    id: 'dental',
    name: 'Nhóm âm đầu lưỡi trước (平舌音)',
    diagram: 'dental',
    tip: 'Lưỡi duỗi thẳng tự nhiên, đầu lưỡi đặt sát mặt sau răng cửa trên/dưới.',
    items: [
      { sym: 'z', read: 'zī', han: '资', vi: 'tư (thẳng lưỡi, không bật hơi)', air: 'Không bật hơi', mouth: 'Đầu lưỡi duỗi thẳng chạm nhẹ vào mặt sau răng cửa trên, rồi hơi tách ra cho hơi thoát nhẹ (nghe như "tz" không bật hơi).', mistake: 'Hay đọc thành "d" hoặc "gi".' },
      { sym: 'c', read: 'cī', han: '词', vi: 'xư/txư (thẳng lưỡi, bật hơi)', air: 'Bật hơi mạnh', mouth: 'Đầu lưỡi duỗi thẳng chạm mặt sau răng cửa trên như "z", rồi bật mạnh luồng hơi xì ra qua khe răng ("ts" bật hơi).', mistake: 'Đọc thành "x" hoặc "ch" mà thiếu lực bật ở đầu.' },
      { sym: 's', read: 'sī', han: '思', vi: 'xư (thẳng lưỡi, xát)', air: 'Xát liên tục', mouth: 'Đầu lưỡi duỗi thẳng đặt gần mặt sau răng cửa, luồng hơi xì nhẹ qua khe răng (giống "x" tiếng Việt, nhưng gọn hơn).', mistake: 'Hay uốn lưỡi thành "sh".' }
    ]
  }
];

window.PINYIN_FINALS = [
  {
    name: 'Vận mẫu đơn (单韵母)',
    desc: '6 nguyên âm cơ bản nhất. Cần giữ nguyên khẩu hình từ đầu đến cuối âm.',
    items: [
      { sym: 'a', read: 'ā', han: '啊', mouth: 'Miệng mở rộng tối đa, lưỡi hạ thấp tự nhiên ở giữa khoang miệng.', tip: 'Giống "a" tiếng Việt, mở tròn rõ ràng.' },
      { sym: 'o', read: 'ō', han: '喔', mouth: 'Môi thu tròn vừa phải, lưỡi kéo hơi lùi về sau và nâng vừa.', tip: 'Nghe hơi chuyển nhẹ như "uô" gọn, không đọc bẹt thành "ơ".' },
      { sym: 'e', read: 'ē', han: '鹅', mouth: 'Miệng mở vừa (không tròn môi), khóe miệng hơi kéo sang ngang, cuống lưỡi nâng.', tip: 'Nằm giữa "ơ" và "ưa", đọc kéo nhẹ từ sâu trong họng.' },
      { sym: 'i', read: 'yī', han: '衣', mouth: 'Khóe miệng kéo dẹt sang hai bên như cười, đầu lưỡi sau răng dưới, mặt lưỡi nâng cao.', tip: 'Giống "i" tiếng Việt. Riêng sau zh/ch/sh/r/z/c/s đọc là âm đầu lưỡi "ư".' },
      { sym: 'u', read: 'wū', han: '乌', mouth: 'Môi chu tròn nhỏ ra phía trước, cuống lưỡi nâng cao về sau.', tip: 'Chu môi tròn hơn chữ "u" tiếng Việt.' },
      { sym: 'ü', read: 'yū', han: '迂', mouth: 'Khẩu hình chuẩn: lưỡi đặt ở vị trí chữ "i", nhưng đôi môi chu tròn nhỏ như chữ "u".', tip: 'Mẹo: kéo dài âm "i" rồi giữ nguyên lưỡi, từ từ chu tròn môi lại sẽ ra "ü".' }
    ]
  },
  {
    name: 'Vận mẫu kép (复韵母)',
    desc: 'Kết hợp 2 hoặc 3 nguyên âm. Nguyên âm chính đọc to và rõ nhất, nguyên âm phụ lướt nhẹ.',
    items: [
      { sym: 'ai', read: 'āi', han: '爱', mouth: 'Mở miệng chữ "a" rồi khép nhanh lên "i".', tip: 'Giống "ai" tiếng Việt.' },
      { sym: 'ei', read: 'ēi', han: '飞', mouth: 'Bắt đầu ở "ê" nhẹ rồi lướt lên "i".', tip: 'Giống "ây/êi" ngắn gọn.' },
      { sym: 'ui', read: 'wēi', han: '对', mouth: 'Là dạng viết tắt của "uei": lướt từ "u" sang "êi".', tip: 'Khi đứng một mình viết là "wei", dấu thanh đặt trên chữ "i".' },
      { sym: 'ao', read: 'āo', han: '好', mouth: 'Mở miệng chữ "a" rồi thu tròn môi về "o/u".', tip: 'Giống "ao" tiếng Việt nhưng cuối âm hơi khép môi tròn hơn.' },
      { sym: 'ou', read: 'ōu', han: '欧', mouth: 'Bắt đầu từ "ô" rồi chu môi thêm về "u".', tip: 'Giống "âu" nhưng tròn môi hơn.' },
      { sym: 'iu', read: 'yōu', han: '六', mouth: 'Là dạng viết tắt của "iou": lướt từ "i" sang "ôu".', tip: 'Khi đứng một mình viết là "you", dấu thanh đặt trên chữ "u".' },
      { sym: 'ie', read: 'yē', han: '姐', mouth: 'Lướt từ "i" sang "ê" mở nhẹ.', tip: 'Đọc gần như "iê", âm cuối là "ê" ngắn.' },
      { sym: 'üe', read: 'yuē', han: '月', mouth: 'Chu môi phát âm "ü" rồi mở nhẹ sang "ê".', tip: 'Sau j, q, x, y bỏ hai chấm thành jue, que, xue, yue.' },
      { sym: 'er', read: 'ér', han: '儿', mouth: 'Phát âm "ơ" đồng thời cuộn nhẹ đầu lưỡi lên phía ngạc cứng.', tip: 'Âm uốn lưỡi đặc trưng, không ghép với thanh mẫu.' },
      { sym: 'ia', read: 'yā', han: '家', mouth: 'Lướt nhanh từ "i" sang mở rộng "a".', tip: 'Đọc nhanh thành một âm tiết liền mạch ("ia").' },
      { sym: 'iao', read: 'yāo', han: '要', mouth: 'Từ "i" lướt qua "a" rồi thu tròn về "o".', tip: 'Giống "eo/iao" liền mạch.' },
      { sym: 'ua', read: 'wā', han: '花', mouth: 'Chu môi "u" rồi mở rộng ngay sang "a".', tip: 'Giống "oa" tiếng Việt.' },
      { sym: 'uo', read: 'wō', han: '说', mouth: 'Chu môi "u" rồi mở vừa sang "o".', tip: 'Giống "ua/uô" tròn môi.' },
      { sym: 'uai', read: 'wāi', han: '快', mouth: 'Chu môi "u" -> mở "a" -> lướt lên "i".', tip: 'Giống "oai" tiếng Việt.' }
    ]
  },
  {
    name: 'Vận mẫu mũi trước (-n) & mũi sau (-ng)',
    desc: 'Phân biệt rõ: đuôi -n đưa đầu lưỡi chạm lợi trên (gọn); đuôi -ng nâng cuống lưỡi về sau (vang trong mũi).',
    items: [
      { sym: 'an', read: 'ān', han: '安', mouth: 'Đọc "a" rồi đưa đầu lưỡi chạm lợi trên để kết thúc bằng "-n".', tip: 'Âm mũi trước, nghe gọn.' },
      { sym: 'en', read: 'ēn', han: '门', mouth: 'Đọc "ơ" ngắn rồi khép bằng đầu lưỡi chạm lợi ("-n").', tip: 'Giống "ân" nhưng nhẹ hơn.' },
      { sym: 'in', read: 'yīn', han: '新', mouth: 'Đọc "i" rồi đưa đầu lưỡi lên lợi trên.', tip: 'Đứng một mình viết là "yin".' },
      { sym: 'un', read: 'wēn', han: '春', mouth: 'Viết tắt của "uen": chu môi "u" + "ơn".', tip: 'Đứng một mình viết là "wen".' },
      { sym: 'ün', read: 'yūn', han: '云', mouth: 'Chu môi "ü" rồi đưa đầu lưỡi lên lợi trên.', tip: 'Sau j, q, x, y viết là jun, qun, xun, yun.' },
      { sym: 'ang', read: 'āng', han: '帮', mouth: 'Mở rộng "a", sau đó nâng cuống lưỡi chạm ngạc mềm để hơi vang ra mũi.', tip: 'Mở to và vang hơn "an" rõ rệt.' },
      { sym: 'eng', read: 'ēng', han: '风', mouth: 'Từ "ơ" kéo cuống lưỡi lên ngạc mềm tạo âm mũi sau vang.', tip: 'Khác với "en" ở chỗ đầu lưỡi không chạm lợi.' },
      { sym: 'ing', read: 'yīng', han: '听', mouth: 'Đọc "i" rồi hạ cuống lưỡi về sau tạo âm vang "-ng".', tip: 'Đứng một mình viết là "ying".' },
      { sym: 'ong', read: 'ōng', han: '中', mouth: 'Chu môi như "u/ô" rồi đẩy âm vang mũi sau "-ng".', tip: 'Nghe giống "ung" tròn môi.' },
      { sym: 'ian', read: 'yiān', han: '天', mouth: 'Lướt "i" sang "e" mở nhẹ rồi khép đầu lưỡi "-n".', tip: 'Lưu ý: nghe gần giống "iên" chứ không phải "ian".' },
      { sym: 'iang', read: 'yiāng', han: '想', mouth: 'Lướt "i" sang "a" mở rộng rồi đẩy vang "-ng".', tip: 'Đứng một mình viết là "yang".' },
      { sym: 'iong', read: 'yōng', han: '用', mouth: 'Lướt từ "i" (hoặc "ü") sang "ung".', tip: 'Đứng một mình viết là "yong".' },
      { sym: 'uan', read: 'wān', han: '关', mouth: 'Chu môi "u" -> "a" -> đầu lưỡi chạm lợi "-n".', tip: 'Sau j, q, x, y đọc thành "üan" (juan, quan, xuan, yuan).' },
      { sym: 'uang', read: 'wāng', han: '黄', mouth: 'Chu môi "u" -> mở rộng "a" -> vang mũi sau "-ng".', tip: 'Đứng một mình viết là "wang".' },
      { sym: 'üan', read: 'yuān', han: '元', mouth: 'Chu môi "ü" rồi chuyển sang "a-n" (gần "uyên").', tip: 'Luôn viết là juan, quan, xuan, yuan.' }
    ]
  }
];

window.PINYIN_TONES = [
  {
    num: 1, name: 'Thanh 1 (Âm bình)', mark: 'ˉ', pitch: '55', ex: 'mā', han: '妈', vi: 'mẹ',
    desc: 'Đọc cao, bằng phẳng và đều đặn từ đầu đến cuối (mức 5 -> 5). Không lên giọng, không tụt giọng.',
    tip: 'Tưởng tượng bạn đang ngân một nốt cao ổn định khi luyện thanh.'
  },
  {
    num: 2, name: 'Thanh 2 (Dương bình)', mark: 'ˊ', pitch: '35', ex: 'má', han: '麻', vi: 'tê, gai',
    desc: 'Đi từ mức trung bình vút thẳng lên mức cao nhất (mức 3 -> 5), nghe giống như đang ngạc nhiên hỏi "Hả?".',
    tip: 'Không đọc võng xuống trước rồi mới lên; phải đi lên dứt khoát như dấu sắc nhưng nhẹ đầu hơn.'
  },
  {
    num: 3, name: 'Thanh 3 (Thượng thanh)', mark: 'ˇ', pitch: '214', ex: 'mǎ', han: '马', vi: 'ngựa',
    desc: 'Xuống thấp chạm đáy rồi mới uốn nhẹ lên (mức 2 -> 1 -> 4). Trong giao tiếp thực tế, thường chỉ đọc nửa thanh 3 (xuống thấp trầm 2 -> 1).',
    tip: 'Mẹo: hạ giọng trầm xuống đáy cổ họng; khi đứng một mình hoặc cuối câu mới lượn nhẹ lên.'
  },
  {
    num: 4, name: 'Thanh 4 (Khứ thanh)', mark: 'ˋ', pitch: '51', ex: 'mà', han: '骂', vi: 'mắng',
    desc: 'Rơi nhanh, mạnh và dứt khoát từ đỉnh cao nhất xuống đáy thấp nhất (mức 5 -> 1).',
    tip: 'Ngắn gọn, dứt khoát như tiếng chặt hoặc câu khẳng định mạnh.'
  },
  {
    num: 0, name: 'Thanh nhẹ (轻声)', mark: '·', pitch: 'ngắn', ex: 'ma', han: '吗', vi: 'trợ từ hỏi',
    desc: 'Không có dấu thanh trên chữ. Đọc thật nhẹ, ngắn và lướt nhanh, độ cao phụ thuộc vào thanh điệu đứng ngay trước nó.',
    tip: 'Hay gặp ở trợ từ (吗, 呢, 的, 了) và chữ thứ 2 của từ láy (妈妈 māma, 谢谢 xièxie).'
  }
];

/* Danh sách các âm tiết Pinyin hợp lệ (không dấu) kèm chữ Hán ví dụ thông dụng */
window.PINYIN_SYLLABLES = {
  ba:'八 (8)',pa:'爬 (leo)',ma:'妈 (mẹ)',fa:'发 (phát)',da:'大 (to)',ta:'他 (anh ấy)',na:'那 (kia)',la:'拉 (kéo)',ga:'嘎',ka:'卡 (thẻ)',ha:'哈',zha:'扎',cha:'茶 (trà)',sha:'沙 (cát)',za:'杂',ca:'擦 (lau)',sa:'撒',a:'啊',
  bo:'波 (sóng)',po:'坡 (dốc)',mo:'摸 (sờ)',fo:'佛 (Phật)',o:'喔',
  me:'么',de:'的',te:'特 (đặc biệt)',ne:'呢',le:'了',ge:'哥 (anh trai)',ke:'课 (bài học)',he:'喝 (uống)',zhe:'这 (này)',che:'车 (xe)',she:'蛇 (rắn)',re:'热 (nóng)',ze:'则',ce:'测',se:'色 (màu)',e:'饿 (đói)',
  bi:'比 (so)',pi:'皮 (da)',mi:'米 (gạo)',di:'地 (đất)',ti:'踢 (đá)',ni:'你 (bạn)',li:'里 (trong)',ji:'鸡 (gà)',qi:'七 (7)',xi:'西 (tây)',zhi:'知 (biết)',chi:'吃 (ăn)',shi:'十 (10)',ri:'日 (ngày)',zi:'字 (chữ)',ci:'词 (từ)',si:'四 (4)',yi:'一 (1)',
  bu:'不 (không)',pu:'普',mu:'木 (gỗ)',fu:'父 (cha)',du:'读 (đọc)',tu:'图 (tranh)',nu:'努 (nỗ lực)',lu:'路 (đường)',gu:'古 (cổ)',ku:'哭 (khóc)',hu:'湖 (hồ)',zhu:'住 (ở)',chu:'出 (ra)',shu:'书 (sách)',ru:'入 (vào)',zu:'租 (thuê)',cu:'粗',su:'苏',wu:'五 (5)',
  nü:'女 (nữ)',lü:'绿 (xanh lá)',ju:'居',qu:'去 (đi)',xu:'需 (cần)',yu:'鱼 (cá)',
  bai:'白 (trắng)',pai:'拍 (chụp)',mai:'买 (mua)',dai:'带 (mang)',tai:'太 (quá)',nai:'奶 (sữa)',lai:'来 (đến)',gai:'该 (nên)',kai:'开 (mở)',hai:'还 (vẫn)',zhai:'摘',chai:'拆',shai:'晒 (phơi)',zai:'在 (ở)',cai:'菜 (món ăn)',sai:'赛 (thi)',ai:'爱 (yêu)',
  bei:'杯 (cốc)',pei:'陪 (cùng)',mei:'没 (không)',fei:'飞 (bay)',dei:'得',nei:'内 (trong)',lei:'累 (mệt)',gei:'给 (cho)',hei:'黑 (đen)',zhei:'这',shei:'谁 (ai)',zei:'贼',ei:'诶',
  bao:'包 (túi)',pao:'跑 (chạy)',mao:'猫 (mèo)',dao:'到 (đến)',tao:'套',nao:'脑 (não)',lao:'老 (già)',gao:'高 (cao)',kao:'考 (thi)',hao:'好 (tốt)',zhao:'找 (tìm)',chao:'超 (siêu)',shao:'少 (ít)',rao:'绕',zao:'早 (sớm)',cao:'草 (cỏ)',sao:'扫 (quét)',ao:'奥',
  pou:'剖',mou:'某',fou:'否',dou:'都 (đều)',tou:'头 (đầu)',lou:'楼 (lầu)',gou:'狗 (chó)',kou:'口 (miệng)',hou:'后 (sau)',zhou:'周 (tuần)',chou:'抽',shou:'手 (tay)',rou:'肉 (thịt)',zou:'走 (đi)',cou:'凑',sou:'搜',ou:'欧',
  ban:'半 (nửa)',pan:'盘 (đĩa)',man:'慢 (chậm)',fan:'饭 (cơm)',dan:'蛋 (trứng)',tan:'谈 (nói)',nan:'男 (nam)',lan:'蓝 (xanh)',gan:'干 (làm)',kan:'看 (xem)',han:'汉 (Hán)',zhan:'站 (đứng)',chan:'产',shan:'山 (núi)',ran:'然',zan:'咱',can:'参 (tham gia)',san:'三 (3)',an:'安 (bình an)',
  ben:'本 (cuốn)',pen:'盆 (chậu)',men:'门 (cửa)',fen:'分 (phút)',nen:'嫩',gen:'跟 (cùng)',ken:'肯',hen:'很 (rất)',zhen:'真 (thật)',chen:'沉',shen:'身 (thân)',ren:'人 (người)',zen:'怎 (sao)',cen:'参',sen:'森 (rừng)',en:'恩',
  bang:'帮 (giúp)',pang:'胖 (béo)',mang:'忙 (bận)',fang:'房 (phòng)',dang:'当',tang:'糖 (đường)',nang:'囊',lang:'浪',gang:'刚 (vừa mới)',kang:'康 (khỏe)',hang:'行',zhang:'张',chang:'长 (dài)',shang:'上 (trên)',rang:'让 (nhường)',zang:'脏 (bẩn)',cang:'藏',sang:'嗓',ang:'昂',
  beng:'蹦',peng:'朋 (bạn)',meng:'梦 (mơ)',feng:'风 (gió)',deng:'等 (đợi)',teng:'疼 (đau)',neng:'能 (có thể)',leng:'冷 (lạnh)',geng:'更 (càng)',keng:'坑',heng:'横',zheng:'正 (đang)',cheng:'成 (thành)',sheng:'生 (sinh)',reng:'扔 (ném)',zeng:'增',ceng:'层 (tầng)',seng:'僧',
  dong:'东 (đông)',tong:'同 (cùng)',nong:'农 (nông)',long:'龙 (rồng)',gong:'工 (công)',kong:'空 (trống)',hong:'红 (đỏ)',zhong:'中 (giữa)',chong:'充',rong:'容',zong:'总 (luôn)',cong:'从 (từ)',song:'送 (tặng)',
  jia:'家 (nhà)',qia:'恰',xia:'下 (dưới)',ya:'呀',
  bie:'别 (đừng)',pie:'撇',mie:'灭',die:'爹',tie:'铁 (sắt)',nie:'捏',lie:'列',jie:'姐 (chị)',qie:'切 (cắt)',xie:'写 (viết)',ye:'也 (cũng)',
  biao:'表 (đồng hồ)',piao:'票 (vé)',miao:'秒 (giây)',diao:'掉 (rơi)',tiao:'条 (con/chiếc)',niao:'鸟 (chim)',liao:'聊 (tán gẫu)',jiao:'叫 (gọi)',qiao:'桥 (cầu)',xiao:'小 (nhỏ)',yao:'要 (muốn)',
  miu:'谬',diu:'丢 (mất)',niu:'牛 (bò)',liu:'六 (6)',jiu:'九 (9)',qiu:'球 (bóng)',xiu:'休 (nghỉ)',you:'有 (có)',
  bian:'边 (bên)',pian:'片 (mảnh)',mian:'面 (mặt/mì)',dian:'点 (giờ)',tian:'天 (trời)',nian:'年 (năm)',lian:'练 (luyện)',jian:'见 (gặp)',qian:'钱 (tiền)',xian:'先 (trước)',yan:'眼 (mắt)',
  bin:'宾 (khách)',pin:'品 (phẩm)',min:'民 (dân)',nin:'您 (ngài)',lin:'林 (rừng)',jin:'今 (nay)',qin:'亲 (thân)',xin:'新 (mới)',yin:'音 (âm)',
  niang:'娘',liang:'两 (2)',jiang:'讲 (giảng)',qiang:'强 (mạnh)',xiang:'想 (muốn/nhớ)',yang:'羊 (cừu)',
  bing:'病 (bệnh)',ping:'平 (bình)',ming:'名 (tên)',ding:'订 (đặt)',ting:'听 (nghe)',ning:'宁',ling:'零 (0)',jing:'京',qing:'请 (mời)',xing:'星 (sao)',ying:'英',
  jiong:'窘',qiong:'穷 (nghèo)',xiong:'兄 (anh)',yong:'用 (dùng)',
  gua:'瓜 (dưa)',kua:'夸 (khen)',hua:'花 (hoa)',zhua:'抓 (bắt)',shua:'刷 (quẹt)',wa:'哇',
  duo:'多 (nhiều)',tuo:'脱 (cởi)',nuo:'挪',luo:'落 (rơi)',guo:'国 (nước)',kuo:'扩',huo:'火 (lửa)',zhuo:'桌 (bàn)',chuo:'戳',shuo:'说 (nói)',ruo:'弱 (yếu)',zuo:'坐 (ngồi)',cuo:'错 (sai)',suo:'所',wo:'我 (tôi)',
  guai:'怪 (lạ)',kuai:'快 (nhanh)',huai:'坏 (hỏng)',zhuai:'拽',chuai:'揣',shuai:'帅 (đẹp trai)',wai:'外 (ngoài)',
  dui:'对 (đúng)',tui:'腿 (chân)',gui:'贵 (đắt)',kui:'亏',hui:'会 (biết)',zhui:'追 (đuổi)',chui:'吹 (thổi)',shui:'水 (nước)',rui:'瑞',zui:'最 (nhất)',cui:'催',sui:'岁 (tuổi)',wei:'为 (vì)',
  duan:'短 (ngắn)',tuan:'团 (đoàn)',nuan:'暖 (ấm)',luan:'乱 (loạn)',guan:'关 (đóng)',kuan:'宽 (rộng)',huan:'换 (đổi)',zhuan:'专 (chuyên)',chuan:'穿 (mặc)',shuan:'拴',ruan:'软 (mềm)',zuan:'钻',cuan:'窜',suan:'酸 (chua)',wan:'玩 (chơi)',juan:'卷',quan:'全 (toàn)',xuan:'选 (chọn)',yuan:'远 (xa)',
  dun:'顿',tun:'吞',lun:'论 (luận)',gun:'滚',kun:'困 (buồn ngủ)',hun:'婚 (hôn)',zhun:'准 (chuẩn)',chun:'春 (xuân)',shun:'顺 (thuận)',run:'润',zun:'尊',cun:'村 (làng)',sun:'孙',wen:'问 (hỏi)',jun:'军',qun:'群 (nhóm)',xun:'寻',yun:'云 (mây)',
  guang:'光 (ánh sáng)',kuang:'况',huang:'黄 (vàng)',zhuang:'装',chuang:'床 (giường)',shuang:'双 (đôi)',wang:'忘 (quên)',
  nüe:'虐',lüe:'略',jue:'觉 (cảm thấy)',que:'却 (nhưng)',xue:'学 (học)',yue:'月 (tháng)',
  er:'二 (2)'
};

window.PINYIN_TONE_HAN = {"a":{"1":"啊","2":"嗄","0":"啊"},"ai":{"1":"哀","2":"癌","3":"矮","4":"爱"},"an":{"1":"安","2":"儑","3":"俺","4":"按"},"ang":{"1":"肮","2":"昂","4":"枊"},"ao":{"1":"凹","2":"熬","3":"拗","4":"傲"},"ba":{"1":"八","2":"拔","3":"把","4":"爸","0":"吧"},"bai":{"1":"掰","2":"白","3":"百","4":"拜"},"ban":{"1":"班","3":"版","4":"半","0":"螁"},"bang":{"1":"帮","3":"榜","4":"棒"},"bao":{"1":"包","2":"薄","3":"饱","4":"报"},"bei":{"1":"杯","3":"北","4":"被","0":"呗"},"ben":{"1":"奔","3":"本","4":"笨"},"beng":{"1":"崩","2":"甭","3":"埄","4":"泵","0":"揼"},"bi":{"1":"逼","2":"鼻","3":"比","4":"毕"},"bian":{"1":"边","3":"匾","4":"遍","0":"炞"},"biao":{"1":"标","3":"表","4":"俵"},"bie":{"1":"憋","2":"别","3":"瘪","4":"彆"},"bin":{"1":"宾","4":"鬓","0":"氞"},"bing":{"1":"冰","3":"饼","4":"病"},"bo":{"1":"波","2":"博","3":"簸","4":"孹","0":"卜"},"bu":{"1":"峬","2":"轐","3":"补","4":"不"},"ca":{"1":"擦","3":"礤","4":"囃"},"cai":{"1":"猜","2":"才","3":"彩","4":"菜"},"can":{"1":"参","2":"惭","3":"惨","4":"掺"},"cang":{"1":"仓","2":"藏","4":"賶"},"cao":{"1":"操","2":"曹","3":"草","4":"肏"},"ce":{"4":"册"},"cen":{"1":"参","2":"岑"},"ceng":{"1":"噌","2":"层","4":"蹭"},"cha":{"1":"叉","2":"茶","3":"衩","4":"差"},"chai":{"1":"拆","2":"柴","3":"茝","4":"囆"},"chan":{"1":"搀","2":"缠","3":"产","4":"颤"},"chang":{"1":"昌","2":"长","3":"场","4":"唱","0":"蟐"},"chao":{"1":"超","2":"嘲","3":"炒","4":"仦"},"che":{"1":"车","3":"扯","4":"彻"},"chen":{"1":"嗔","2":"陈","3":"墋","4":"衬"},"cheng":{"1":"称","2":"城","3":"逞","4":"秤"},"chi":{"1":"吃","2":"持","3":"尺","4":"斥","0":"麶"},"chong":{"1":"充","2":"崇","3":"宠","4":"揰"},"chou":{"1":"抽","2":"仇","3":"丑","4":"臭"},"chu":{"1":"出","2":"厨","3":"楚","4":"处","0":"榋"},"chuai":{"1":"揣","2":"膗","4":"啜"},"chuan":{"1":"穿","2":"船","3":"喘","4":"串"},"chuang":{"1":"窗","2":"床","3":"闯","4":"创"},"chui":{"1":"吹","2":"垂"},"chun":{"1":"春","2":"唇","3":"蠢"},"chuo":{"1":"戳","4":"绰"},"ci":{"1":"偨","2":"词","3":"此","4":"次"},"cong":{"1":"聪","2":"从","4":"憁"},"cou":{"4":"凑"},"cu":{"1":"粗","2":"徂","4":"促"},"cuan":{"1":"撺","2":"巑","4":"窜"},"cui":{"1":"催","3":"漼","4":"悴","0":"乼"},"cun":{"1":"村","2":"存","3":"刌","4":"寸"},"cuo":{"1":"搓","2":"嵯","3":"脞","4":"错"},"da":{"1":"搭","2":"答","3":"打","4":"大","0":"垯"},"dai":{"1":"待","3":"傣","4":"带","0":"鮘"},"dan":{"1":"单","3":"掸","4":"但"},"dang":{"1":"当","3":"党","4":"当"},"dao":{"1":"刀","2":"捯","3":"导","4":"到"},"de":{"1":"嘚","2":"得","0":"的"},"dei":{"3":"得"},"deng":{"1":"灯","3":"等","4":"凳"},"di":{"1":"低","2":"嘀","3":"底","4":"第"},"dian":{"1":"掂","3":"点","4":"店"},"diao":{"1":"刁","3":"屌","4":"调"},"die":{"1":"爹","2":"叠","4":"哋"},"ding":{"1":"丁","3":"顶","4":"订"},"diu":{"1":"丢"},"dong":{"1":"东","3":"懂","4":"动"},"dou":{"1":"都","3":"抖","4":"斗"},"du":{"1":"督","2":"读","3":"堵","4":"度"},"duan":{"1":"端","3":"短","4":"段"},"dui":{"1":"堆","3":"頧","4":"对"},"dun":{"1":"吨","3":"盹","4":"顿"},"duo":{"1":"多","2":"夺","3":"躲","4":"堕"},"e":{"1":"妸","2":"俄","3":"噁","4":"饿"},"ei":{"2":"誒"},"en":{"1":"恩","3":"峎","4":"摁"},"er":{"2":"而","3":"尔","4":"二"},"fa":{"1":"发","2":"乏","3":"法","4":"珐"},"fan":{"1":"翻","2":"烦","3":"反","4":"饭"},"fang":{"1":"方","2":"房","3":"访","4":"放","0":"堏"},"fei":{"1":"飞","2":"肥","3":"匪","4":"费"},"fen":{"1":"分","2":"坟","3":"粉","4":"份"},"feng":{"1":"封","2":"冯","3":"讽","4":"凤"},"fo":{"2":"仏"},"fou":{"2":"紑","3":"否"},"fu":{"1":"夫","2":"服","3":"俯","4":"付","0":"酜"},"ga":{"1":"嘎","2":"噶","3":"尕","4":"尬"},"gai":{"1":"该","3":"改","4":"概"},"gan":{"1":"杆","3":"感","4":"干"},"gang":{"1":"刚","3":"岗","4":"戅"},"gao":{"1":"高","3":"搞","4":"告"},"ge":{"1":"歌","2":"格","3":"哿","4":"个"},"gei":{"3":"给"},"gen":{"1":"跟","2":"哏","3":"艮","4":"亘"},"geng":{"1":"羹","3":"埂","4":"更"},"gong":{"1":"工","3":"巩","4":"共","0":"慐"},"gou":{"1":"勾","3":"狗","4":"够"},"gu":{"1":"估","2":"鶻","3":"鼓","4":"故"},"gua":{"1":"刮","3":"寡","4":"挂"},"guai":{"1":"乖","3":"拐","4":"怪"},"guan":{"1":"关","3":"管","4":"惯"},"guang":{"1":"光","3":"广","4":"逛","0":"欟"},"gui":{"1":"规","3":"诡","4":"贵"},"gun":{"3":"滚","4":"棍"},"guo":{"1":"锅","2":"国","3":"果","4":"过"},"ha":{"1":"哈","2":"蛤","3":"奤"},"hai":{"1":"咍","2":"还","3":"海","4":"害","0":"嚡"},"han":{"1":"憨","2":"寒","3":"喊","4":"汗","0":"兯"},"hang":{"1":"夯","2":"航","4":"沆"},"hao":{"1":"蒿","2":"嚎","3":"好","4":"号"},"he":{"1":"喝","2":"和","4":"褐"},"hei":{"1":"黑"},"hen":{"2":"痕","3":"很","4":"恨"},"heng":{"1":"哼","2":"恒","4":"堼"},"hong":{"1":"烘","2":"红","3":"哄","4":"撔"},"hou":{"1":"齁","2":"侯","3":"吼","4":"后"},"hu":{"1":"呼","2":"湖","3":"虎","4":"护"},"hua":{"1":"花","2":"华","4":"画"},"huai":{"2":"徊","4":"坏"},"huan":{"1":"欢","2":"还","3":"缓","4":"换"},"huang":{"1":"慌","2":"黄","3":"幌","4":"愰"},"hui":{"1":"徽","2":"回","3":"悔","4":"会","0":"懳"},"hun":{"1":"婚","2":"浑","4":"混"},"huo":{"1":"豁","2":"活","3":"火","4":"或"},"ji":{"1":"鸡","2":"急","3":"几","4":"记"},"jia":{"1":"家","2":"荚","3":"假","4":"价"},"jian":{"1":"间","3":"减","4":"见","0":"橺"},"jiang":{"1":"将","3":"讲","4":"降"},"jiao":{"1":"教","3":"脚","4":"叫","0":"櫵"},"jie":{"1":"接","2":"节","3":"解","4":"借"},"jin":{"1":"斤","3":"仅","4":"近"},"jing":{"1":"京","3":"景","4":"静","0":"燝"},"jiong":{"1":"冂","3":"窘"},"jiu":{"1":"究","3":"久","4":"就"},"ju":{"1":"居","2":"局","3":"举","4":"句","0":"爠"},"juan":{"1":"捐","3":"卷","4":"卷"},"jue":{"1":"噘","2":"觉"},"jun":{"1":"军","4":"俊"},"ka":{"1":"咖","3":"卡"},"kai":{"1":"开","3":"凯","4":"勓"},"kan":{"1":"刊","3":"砍","4":"看"},"kang":{"1":"康","2":"扛","4":"抗"},"kao":{"1":"尻","3":"考","4":"靠"},"ke":{"1":"科","2":"咳","3":"渴","4":"课"},"ken":{"3":"肯","4":"掯"},"keng":{"1":"坑"},"kong":{"1":"空","3":"恐","4":"控"},"kou":{"1":"抠","3":"口","4":"寇"},"ku":{"1":"哭","3":"苦","4":"裤"},"kua":{"1":"夸","3":"垮","4":"挎"},"kuai":{"3":"擓","4":"块"},"kuan":{"1":"宽","3":"款"},"kuang":{"1":"框","2":"狂","3":"儣","4":"况"},"kui":{"1":"亏","2":"葵","3":"煃","4":"愧"},"kun":{"1":"坤","3":"捆","4":"困","0":"尡"},"kuo":{"4":"廓"},"la":{"1":"垃","2":"剌","3":"喇","4":"辣","0":"啦"},"lai":{"2":"来","4":"癞"},"lan":{"2":"蓝","3":"懒","4":"滥"},"lang":{"1":"啷","2":"廊","3":"朗","4":"浪","0":"唥"},"lao":{"1":"捞","2":"劳","3":"老","4":"涝"},"le":{"1":"肋","4":"乐","0":"了"},"lei":{"1":"勒","2":"雷","3":"儡","4":"累","0":"嘞"},"leng":{"2":"棱","3":"冷","4":"倰"},"li":{"1":"哩","2":"离","3":"里","4":"力"},"lian":{"2":"连","3":"脸","4":"练"},"liang":{"2":"凉","3":"两","4":"辆","0":"煷"},"liao":{"1":"撩","2":"聊","3":"瞭","4":"料"},"lie":{"3":"咧","4":"列"},"lin":{"1":"拎","2":"邻","3":"凛","4":"吝"},"ling":{"2":"零","3":"岭","4":"另","0":"瀮"},"liu":{"1":"溜","2":"留","3":"柳","4":"六"},"long":{"2":"笼","3":"垄","4":"哢"},"lou":{"1":"瞜","2":"楼","3":"搂","4":"漏"},"lu":{"1":"噜","2":"卢","3":"卤","4":"路","0":"氇"},"luan":{"2":"峦","3":"卵","4":"乱"},"lun":{"1":"抡","2":"仑","3":"埨","4":"论"},"luo":{"1":"落","2":"罗","3":"裸","4":"络"},"lü":{"2":"驴","3":"旅","4":"绿"},"lüe":{"4":"掠"},"ma":{"1":"妈","2":"麻","3":"马","4":"骂","0":"吗"},"mai":{"2":"埋","3":"买","4":"卖"},"man":{"1":"嫚","2":"瞒","3":"满","4":"慢"},"mang":{"1":"牤","2":"忙","3":"莽"},"mao":{"1":"猫","2":"毛","3":"铆","4":"帽"},"me":{"1":"嚒","0":"么"},"mei":{"2":"没","3":"每","4":"妹"},"men":{"1":"椚","2":"门","4":"闷","0":"们"},"meng":{"1":"擝","2":"朦","3":"猛","4":"梦","0":"掹"},"mi":{"1":"咪","2":"迷","3":"米","4":"密"},"mian":{"2":"棉","3":"免","4":"面"},"miao":{"1":"喵","2":"描","3":"渺","4":"妙"},"mie":{"1":"乜","4":"灭"},"min":{"2":"民","3":"悯","0":"垊"},"ming":{"2":"名","3":"佲","4":"命","0":"掵"},"miu":{"4":"谬"},"mo":{"1":"摸","2":"模","3":"抹","4":"末","0":"怽"},"mou":{"1":"哞","2":"谋","3":"某"},"mu":{"2":"墲","3":"母","4":"目"},"na":{"2":"拿","3":"哪","4":"那"},"nai":{"2":"孻","3":"奶","4":"耐"},"nan":{"1":"囡","2":"男","3":"戁","4":"婻"},"nang":{"1":"囊","2":"囊","3":"擃","4":"儾"},"nao":{"1":"孬","2":"挠","3":"脑","4":"闹"},"ne":{"4":"抐","0":"呢"},"nei":{"3":"馁","4":"内"},"nen":{"4":"嫩"},"neng":{"2":"能"},"ni":{"1":"妮","2":"尼","3":"你","4":"匿"},"nian":{"1":"蔫","2":"年","3":"捻","4":"念"},"niang":{"2":"娘","4":"酿"},"niao":{"3":"鸟","4":"尿"},"nie":{"1":"捏","2":"苶","4":"孽"},"nin":{"2":"您","3":"拰","0":"脌"},"ning":{"2":"凝","3":"橣","4":"泞"},"niu":{"1":"妞","2":"牛","3":"钮"},"nong":{"2":"农","3":"繷","4":"弄"},"nu":{"2":"奴","3":"努","4":"怒"},"nuan":{"2":"奻","3":"暖"},"nuo":{"2":"挪","3":"橠","4":"懦"},"nü":{"3":"女","4":"恧"},"nüe":{"4":"疟"},"o":{"1":"喔","2":"哦"},"ou":{"1":"欧","2":"齵","3":"偶","4":"怄"},"pa":{"1":"趴","2":"爬","4":"怕"},"pai":{"1":"拍","2":"排","3":"廹","4":"派"},"pan":{"1":"攀","2":"盘","4":"判"},"pang":{"1":"乓","2":"旁","3":"嗙","4":"胖"},"pao":{"1":"抛","2":"刨","3":"跑","4":"泡"},"pei":{"1":"胚","2":"陪","3":"俖","4":"佩"},"pen":{"1":"喷","2":"盆","3":"呠","4":"喯"},"peng":{"1":"澎","2":"朋","3":"捧","4":"碰"},"pi":{"1":"批","2":"脾","3":"匹","4":"僻"},"pian":{"1":"片","2":"楄","3":"覑","4":"片"},"piao":{"1":"漂","2":"瓢","3":"殍","4":"票"},"pie":{"1":"撇","3":"丿","4":"嫳"},"pin":{"1":"拼","2":"频","3":"品","4":"聘"},"ping":{"1":"乒","2":"平"},"po":{"1":"泼","2":"婆","3":"颇","4":"破","0":"桲"},"pou":{"1":"剖","2":"抔","3":"咅"},"pu":{"1":"仆","2":"葡","3":"普","4":"瀑","0":"巬"},"qi":{"1":"期","2":"骑","3":"起","4":"气","0":"簯"},"qia":{"1":"掐","2":"拤","3":"峠","4":"恰"},"qian":{"1":"千","2":"前","3":"浅","4":"歉","0":"籖"},"qiang":{"1":"呛","2":"强","3":"抢","4":"唴"},"qiao":{"1":"悄","2":"乔","3":"巧","4":"俏"},"qie":{"1":"切","2":"癿","3":"且","4":"切"},"qin":{"1":"亲","2":"琴","3":"寝","4":"吢"},"qing":{"1":"轻","2":"晴","3":"请","4":"庆","0":"硘"},"qiong":{"1":"芎","2":"琼"},"qiu":{"1":"秋","2":"球","3":"搝"},"qu":{"1":"区","2":"渠","3":"取","4":"去","0":"迲"},"quan":{"1":"圈","2":"全","3":"犬","4":"券","0":"椦"},"que":{"1":"缺","2":"瘸","4":"却"},"qun":{"1":"囷","2":"群"},"ran":{"2":"然","3":"染"},"rang":{"2":"瓤","3":"嚷","4":"让"},"rao":{"2":"饶","3":"扰","4":"绕"},"re":{"3":"惹","4":"热"},"ren":{"2":"人","3":"忍","4":"认"},"reng":{"1":"扔","2":"仍","4":"芿"},"ri":{"4":"日"},"rong":{"1":"茸","2":"容","3":"冗","0":"穃"},"rou":{"2":"揉","3":"楺","4":"肉"},"ru":{"2":"如","3":"乳","4":"入","0":"嶿"},"ruan":{"2":"堧","3":"软"},"rui":{"2":"婑","3":"蕊","4":"瑞"},"run":{"2":"瞤","4":"润"},"ruo":{"2":"捼","4":"弱"},"sa":{"1":"撒","3":"洒","4":"萨"},"sai":{"1":"塞","4":"赛"},"san":{"1":"三","3":"伞","4":"散","0":"壭"},"sang":{"1":"桑","3":"嗓","4":"丧"},"sao":{"1":"搔","3":"扫","4":"埽"},"se":{"1":"閪","4":"色"},"sen":{"1":"森"},"seng":{"1":"僧"},"sha":{"1":"沙","2":"啥","3":"傻","4":"厦","0":"繌"},"shai":{"1":"筛","3":"繺","4":"晒"},"shan":{"1":"山","3":"闪","4":"善"},"shang":{"1":"商","3":"晌","4":"上","0":"裳"},"shao":{"1":"烧","2":"勺","3":"少","4":"绍"},"she":{"1":"奢","2":"舌","3":"舍","4":"社"},"shei":{"2":"谁"},"shen":{"1":"身","2":"什","3":"婶","4":"甚"},"sheng":{"1":"声","2":"绳","3":"省","4":"剩"},"shi":{"1":"师","2":"时","3":"使","4":"是","0":"匙"},"shou":{"1":"收","3":"手","4":"瘦","0":"扌"},"shu":{"1":"书","2":"熟","3":"鼠","4":"树"},"shua":{"1":"刷","3":"耍","4":"誜"},"shuai":{"1":"摔","3":"甩","4":"帅"},"shuan":{"1":"拴","4":"涮"},"shuang":{"1":"双","3":"爽","4":"灀"},"shui":{"2":"谁","3":"水","4":"睡","0":"氵"},"shun":{"3":"吮","4":"顺"},"shuo":{"1":"说","4":"硕"},"si":{"1":"司","3":"死","4":"四"},"song":{"1":"松","3":"耸","4":"送"},"sou":{"1":"搜","3":"傁","4":"嗽"},"su":{"1":"苏","2":"俗","4":"诉"},"suan":{"1":"酸","3":"匴","4":"算"},"sui":{"1":"虽","2":"随","3":"髓","4":"岁"},"sun":{"1":"孙","3":"损"},"suo":{"1":"唆","3":"所","4":"溹","0":"嗦"},"ta":{"1":"她","2":"蹹","3":"塔","4":"踏","0":"侤"},"tai":{"1":"胎","2":"台","4":"太","0":"粏"},"tan":{"1":"摊","2":"谈","3":"坦","4":"叹"},"tang":{"1":"汤","2":"堂","3":"躺","4":"趟"},"tao":{"1":"掏","2":"萄","3":"讨","4":"套"},"te":{"4":"特"},"teng":{"1":"熥","2":"疼","4":"霯"},"ti":{"1":"踢","2":"题","3":"体","4":"剃"},"tian":{"1":"天","2":"甜","3":"舔","4":"掭"},"tiao":{"1":"挑","2":"条","3":"嬥","4":"跳","0":"螩"},"tie":{"1":"贴","3":"铁","4":"呫"},"ting":{"1":"听","2":"停","3":"挺"},"tong":{"1":"通","2":"同","3":"统","4":"痛"},"tou":{"1":"偷","2":"头","3":"妵","4":"透"},"tu":{"1":"突","2":"图","3":"吐","4":"兔","0":"汢"},"tuan":{"1":"湍","2":"团","3":"疃","4":"彖"},"tui":{"1":"推","2":"颓","3":"腿","4":"蜕"},"tun":{"1":"吞","2":"屯","3":"氽"},"tuo":{"1":"脱","2":"驮","3":"妥","4":"唾"},"wa":{"1":"哇","2":"娃","3":"瓦","4":"袜","0":"哇"},"wai":{"1":"歪","3":"崴","4":"外"},"wan":{"1":"弯","2":"玩","3":"晚","4":"万"},"wang":{"1":"汪","2":"王","3":"往","4":"忘"},"wei":{"1":"微","2":"维","3":"伟","4":"喂","0":"煀"},"wen":{"1":"温","2":"闻","3":"吻","4":"问","0":"呚"},"wo":{"1":"涡","3":"我","4":"握"},"wu":{"1":"屋","2":"无","3":"午","4":"物","0":"錻"},"xi":{"1":"西","2":"习","3":"洗","4":"细"},"xia":{"1":"瞎","2":"侠","3":"閜","4":"下"},"xian":{"1":"先","2":"咸","3":"显","4":"现","0":"鑦"},"xiang":{"1":"香","2":"详","3":"想","4":"像"},"xiao":{"1":"消","2":"淆","3":"小","4":"笑","0":"恷"},"xie":{"1":"些","2":"鞋","3":"写","4":"谢"},"xin":{"1":"新","2":"枔","3":"伈","4":"信","0":"忄"},"xing":{"1":"兴","2":"行","3":"醒","4":"姓","0":"哘"},"xiong":{"1":"兄","2":"熊","3":"焽","4":"夐"},"xiu":{"1":"休","2":"苬","3":"朽","4":"秀"},"xu":{"1":"需","2":"徐","3":"许","4":"续","0":"蓿"},"xuan":{"1":"喧","2":"悬","3":"选","4":"炫"},"xue":{"1":"削","2":"学","3":"雪","4":"血"},"xun":{"1":"勋","2":"寻","4":"训"},"ya":{"1":"压","2":"牙","3":"哑","4":"亚","0":"呀"},"yan":{"1":"淹","2":"严","3":"演","4":"验"},"yang":{"1":"央","2":"羊","3":"养","4":"样","0":"羪"},"yao":{"1":"邀","2":"姚","3":"咬","4":"要"},"ye":{"1":"掖","2":"爷","3":"也","4":"页","0":"亪"},"yi":{"1":"医","2":"宜","3":"已","4":"意"},"yin":{"1":"阴","2":"银","3":"引","4":"印","0":"粌"},"ying":{"1":"应","2":"赢","3":"影","4":"映"},"yong":{"1":"佣","2":"喁","3":"泳","4":"用"},"you":{"1":"优","2":"游","3":"有","4":"右","0":"蒏"},"yu":{"1":"淤","2":"鱼","3":"雨","4":"遇","0":"澚"},"yuan":{"1":"冤","2":"元","3":"远","4":"院"},"yue":{"1":"约","3":"噦","4":"月"},"yun":{"1":"晕","2":"云","3":"允","4":"运","0":"抣"},"za":{"1":"匝","2":"杂","3":"咋"},"zai":{"1":"栽","3":"仔","4":"在"},"zan":{"1":"兂","2":"咱","3":"攒","4":"暂"},"zang":{"1":"脏","3":"駔","4":"脏"},"zao":{"1":"糟","2":"凿","3":"早","4":"造"},"ze":{"2":"则","4":"仄","0":"伬"},"zei":{"2":"贼"},"zen":{"3":"怎","4":"譖","0":"囎"},"zeng":{"1":"增","4":"赠"},"zha":{"1":"扎","2":"铡","3":"眨","4":"乍"},"zhai":{"1":"摘","2":"宅","3":"窄","4":"债"},"zhan":{"1":"毡","2":"讝","3":"展","4":"站"},"zhang":{"1":"张","3":"长","4":"账","0":"鏱"},"zhao":{"1":"招","3":"找","4":"照","0":"罀"},"zhe":{"1":"遮","2":"折","3":"者","4":"这","0":"着"},"zhei":{},"zhen":{"1":"真","3":"枕","4":"振"},"zheng":{"1":"蒸","3":"整","4":"正"},"zhi":{"1":"只","2":"值","3":"只","4":"至","0":"徔"},"zhong":{"1":"中","3":"种","4":"种"},"zhou":{"1":"周","2":"轴","3":"帚","4":"咒"},"zhu":{"1":"朱","2":"竹","3":"煮","4":"住"},"zhua":{"1":"抓"},"zhuai":{"1":"拽","3":"跩"},"zhuan":{"1":"专","3":"转","4":"撰"},"zhuang":{"1":"装","4":"壮"},"zhui":{"1":"追","3":"沝","4":"坠"},"zhun":{"1":"谆","3":"准","4":"稕"},"zhuo":{"1":"桌","2":"卓","0":"窧"},"zi":{"1":"资","2":"蓻","3":"姊","4":"字","0":"子"},"zong":{"1":"宗","3":"总","4":"纵","0":"潈"},"zou":{"1":"棷","3":"走","4":"奏"},"zu":{"1":"租","2":"族","3":"组"},"zuan":{"1":"钻","3":"籫","4":"攥"},"zui":{"1":"厜","3":"嘴","4":"最","0":"穝"},"zun":{"1":"尊","3":"僔","4":"捘"},"zuo":{"2":"昨","3":"左","4":"做","0":"咗"}};
