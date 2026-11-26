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
    num: 2, name: 'Thanh 2 (Dương bình)', mark: 'ˊ', pitch: '35', ex: 'má', han: '麻', vi: 'gai dầu',
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
    num: 0, name: 'Thanh nhẹ (轻声)', mark: '·', pitch: 'ngắn', ex: 'ma', han: '吗', vi: 'không? (trợ từ)',
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

window.PINYIN_TONE_HAN = {"ba":{"0":"吧","3":"把"},"pa":{"2":"爬","4":"怕"},"ma":{"0":"吗","3":"马"},"fa":{"1":"发"},"da":{"2":"答","3":"打","4":"大"},"ta":{"1":"她"},"na":{"2":"拿","3":"哪","4":"那"},"la":{"4":"辣"},"ga":{"1":"嘎"},"ka":{"3":"卡"},"ha":{"1":"哈"},"zha":{"1":"扎"},"cha":{"2":"茶","4":"差"},"sha":{"1":"沙"},"za":{"1":"杂"},"ca":{"1":"擦"},"sa":{"1":"撒"},"a":{"0":"啊","1":"啊"},"bo":{"1":"波"},"po":{"1":"泼"},"mo":{"1":"摸"},"fo":{"1":"佛"},"o":{"1":"喔"},"me":{"1":"么"},"de":{"0":"的"},"te":{"1":"特"},"ne":{"0":"呢"},"le":{"0":"了"},"ge":{"1":"歌","4":"个"},"ke":{"2":"咳","3":"渴","4":"课"},"he":{"1":"喝","2":"和"},"zhe":{"0":"着","3":"者","4":"这"},"che":{"1":"车"},"she":{"1":"蛇"},"re":{"4":"热"},"ze":{"1":"则"},"ce":{"1":"测"},"se":{"1":"色"},"e":{"4":"饿"},"bi":{"3":"比"},"pi":{"1":"皮"},"mi":{"3":"米"},"di":{"1":"低","4":"第"},"ti":{"1":"踢","2":"题"},"ni":{"3":"你"},"li":{"2":"离","3":"里"},"ji":{"1":"鸡","2":"急","3":"几","4":"记"},"qi":{"1":"期","2":"骑","3":"起"},"xi":{"3":"洗","4":"细"},"zhi":{"1":"只","2":"值","3":"只"},"chi":{"1":"吃"},"shi":{"2":"时","3":"使","4":"是"},"ri":{"4":"日"},"zi":{"4":"字"},"ci":{"2":"词","3":"此","4":"次"},"si":{"1":"四"},"yi":{"1":"医","3":"已"},"bu":{"4":"不"},"pu":{"1":"普"},"mu":{"1":"木"},"fu":{"4":"付"},"du":{"2":"读","4":"度"},"tu":{"1":"图"},"nu":{"1":"努"},"lu":{"4":"路"},"gu":{"1":"古"},"ku":{"1":"哭"},"hu":{"1":"湖"},"zhu":{"3":"煮","4":"住"},"chu":{"1":"出"},"shu":{"1":"书","4":"树"},"ru":{"4":"入"},"zu":{"1":"租"},"cu":{"1":"粗"},"su":{"1":"苏"},"wu":{"2":"无"},"nü":{"3":"女"},"lü":{"1":"绿"},"ju":{"4":"句"},"qu":{"1":"区","3":"取","4":"去"},"xu":{"1":"需"},"yu":{"2":"鱼","3":"雨"},"bai":{"3":"百"},"pai":{"1":"拍","2":"排"},"mai":{"3":"买","4":"卖"},"dai":{"1":"待","4":"带"},"tai":{"2":"台","4":"太"},"nai":{"1":"奶"},"lai":{"2":"来"},"gai":{"1":"该","3":"改"},"kai":{"1":"开"},"hai":{"2":"还","3":"海"},"zhai":{"1":"摘"},"chai":{"1":"拆"},"shai":{"1":"晒"},"zai":{"4":"在"},"cai":{"1":"猜","2":"才","4":"菜"},"sai":{"1":"赛"},"ai":{"3":"矮","4":"爱"},"bei":{"1":"杯","4":"被"},"pei":{"2":"陪"},"mei":{"2":"没","3":"每"},"fei":{"1":"飞","4":"费"},"dei":{"3":"得"},"nei":{"1":"内"},"lei":{"4":"累"},"gei":{"3":"给"},"hei":{"1":"黑"},"zhei":{"1":"这"},"shei":{"2":"谁"},"zei":{"1":"贼"},"ei":{"1":"诶"},"bao":{"1":"包","3":"饱"},"pao":{"3":"跑"},"mao":{"1":"猫","2":"毛"},"dao":{"4":"到"},"tao":{"1":"套"},"nao":{"1":"脑"},"lao":{"3":"老"},"gao":{"1":"高"},"kao":{"3":"考","4":"靠"},"hao":{"3":"好","4":"号"},"zhao":{"3":"找","4":"照"},"chao":{"1":"超"},"shao":{"3":"少"},"rao":{"1":"绕"},"zao":{"3":"早"},"cao":{"1":"草"},"sao":{"1":"扫"},"ao":{"1":"奥"},"pou":{"1":"剖"},"mou":{"1":"某"},"fou":{"1":"否"},"dou":{"1":"都"},"tou":{"2":"头"},"lou":{"2":"楼"},"gou":{"3":"狗","4":"够"},"kou":{"3":"口"},"hou":{"4":"后"},"zhou":{"1":"周"},"chou":{"1":"抽"},"shou":{"1":"收","3":"手","4":"瘦"},"rou":{"4":"肉"},"zou":{"3":"走"},"cou":{"1":"凑"},"sou":{"1":"搜"},"ou":{"1":"欧"},"ban":{"1":"班","3":"版","4":"半"},"pan":{"1":"盘"},"man":{"3":"满","4":"慢"},"fan":{"2":"烦","4":"饭"},"dan":{"4":"但"},"tan":{"2":"谈"},"nan":{"2":"男"},"lan":{"2":"蓝"},"gan":{"3":"感","4":"干"},"kan":{"4":"看"},"han":{"3":"喊","4":"汗"},"zhan":{"4":"站"},"chan":{"1":"产"},"shan":{"1":"山"},"ran":{"1":"然"},"zan":{"1":"咱"},"can":{"1":"参"},"san":{"3":"伞"},"an":{"4":"按"},"ben":{"3":"本"},"pen":{"1":"盆"},"men":{"0":"们","2":"门"},"fen":{"1":"分","4":"份"},"nen":{"1":"嫩"},"gen":{"1":"跟"},"ken":{"1":"肯"},"hen":{"3":"很"},"zhen":{"1":"真"},"chen":{"1":"沉"},"shen":{"1":"身"},"ren":{"2":"人"},"zen":{"1":"怎"},"cen":{"1":"参"},"sen":{"1":"森"},"en":{"1":"恩"},"bang":{"1":"帮","4":"棒"},"pang":{"4":"胖"},"mang":{"2":"忙"},"fang":{"4":"放"},"dang":{"1":"当","4":"当"},"tang":{"1":"汤","4":"趟"},"nang":{"1":"囊"},"lang":{"1":"浪"},"gang":{"1":"刚"},"kang":{"1":"康"},"hang":{"1":"行"},"zhang":{"1":"张","3":"长"},"chang":{"2":"长","4":"唱"},"shang":{"4":"上"},"rang":{"4":"让"},"zang":{"1":"脏"},"cang":{"1":"藏"},"sang":{"1":"嗓"},"ang":{"1":"昂"},"beng":{"1":"蹦"},"peng":{"1":"朋"},"meng":{"4":"梦"},"feng":{"1":"封"},"deng":{"1":"灯","3":"等"},"teng":{"2":"疼"},"neng":{"2":"能"},"leng":{"3":"冷"},"geng":{"4":"更"},"keng":{"1":"坑"},"heng":{"1":"横"},"zheng":{"4":"正"},"cheng":{"2":"城"},"sheng":{"1":"声","3":"省","4":"剩"},"reng":{"1":"扔","2":"仍"},"zeng":{"1":"增"},"ceng":{"2":"层"},"seng":{"1":"僧"},"dong":{"3":"懂","4":"动"},"tong":{"1":"通"},"nong":{"1":"农"},"long":{"1":"龙"},"gong":{"1":"工"},"kong":{"1":"空"},"hong":{"1":"红"},"zhong":{"3":"种","4":"种"},"chong":{"1":"充"},"rong":{"1":"容"},"zong":{"3":"总"},"cong":{"2":"从"},"song":{"4":"送"},"jia":{"1":"家"},"qia":{"1":"恰"},"xia":{"4":"下"},"ya":{"0":"呀"},"bie":{"2":"别"},"pie":{"1":"撇"},"mie":{"1":"灭"},"die":{"1":"爹"},"tie":{"1":"铁"},"nie":{"1":"捏"},"lie":{"4":"列"},"jie":{"1":"接","2":"节","4":"借"},"qie":{"1":"切"},"xie":{"1":"些","2":"鞋","3":"写"},"ye":{"3":"也","4":"页"},"biao":{"3":"表"},"piao":{"4":"票"},"miao":{"1":"秒"},"diao":{"1":"掉"},"tiao":{"2":"条","4":"跳"},"niao":{"3":"鸟"},"liao":{"2":"聊"},"jiao":{"1":"教","3":"脚","4":"叫"},"qiao":{"3":"巧"},"xiao":{"3":"小","4":"笑"},"yao":{"4":"要"},"miu":{"1":"谬"},"diu":{"1":"丢"},"niu":{"2":"牛"},"liu":{"2":"留"},"jiu":{"3":"久","4":"就"},"qiu":{"2":"球"},"xiu":{"1":"休"},"you":{"2":"游","3":"有","4":"右"},"bian":{"4":"遍"},"pian":{"1":"片"},"mian":{"1":"面"},"dian":{"3":"点","4":"店"},"tian":{"1":"天","2":"甜"},"nian":{"2":"年"},"lian":{"2":"连","3":"脸","4":"练"},"jian":{"1":"间","3":"减","4":"见"},"qian":{"2":"前"},"xian":{"1":"先","2":"咸"},"yan":{"3":"演"},"bin":{"1":"宾"},"pin":{"1":"品"},"min":{"1":"民"},"nin":{"2":"您"},"lin":{"1":"林"},"jin":{"1":"斤","3":"仅","4":"近"},"qin":{"1":"亲"},"xin":{"1":"新"},"yin":{"1":"阴"},"niang":{"1":"娘"},"liang":{"2":"凉","3":"两","4":"辆"},"jiang":{"1":"将","3":"讲","4":"降"},"qiang":{"2":"强"},"xiang":{"1":"香","3":"想","4":"像"},"yang":{"2":"羊","3":"养","4":"样"},"bing":{"1":"冰","4":"病"},"ping":{"1":"平"},"ming":{"2":"名"},"ding":{"4":"订"},"ting":{"1":"听","2":"停","3":"挺"},"ning":{"1":"宁"},"ling":{"2":"零","4":"另"},"jing":{"1":"京"},"qing":{"2":"晴","3":"请"},"xing":{"2":"行","3":"醒","4":"姓"},"ying":{"2":"赢"},"jiong":{"1":"窘"},"qiong":{"1":"穷"},"xiong":{"2":"熊"},"yong":{"4":"用"},"gua":{"1":"刮","4":"挂"},"kua":{"1":"夸"},"hua":{"1":"花","4":"画"},"zhua":{"1":"抓"},"shua":{"1":"刷"},"wa":{"1":"哇"},"duo":{"1":"多"},"tuo":{"1":"脱"},"nuo":{"1":"挪"},"luo":{"1":"落"},"guo":{"0":"过","2":"国","4":"过"},"kuo":{"1":"扩"},"huo":{"2":"活","3":"火","4":"或"},"zhuo":{"1":"桌"},"chuo":{"1":"戳"},"shuo":{"1":"说"},"ruo":{"1":"弱"},"zuo":{"3":"左","4":"做"},"cuo":{"4":"错"},"suo":{"1":"所"},"wo":{"3":"我"},"guai":{"1":"怪"},"kuai":{"4":"块"},"huai":{"4":"坏"},"zhuai":{"1":"拽"},"chuai":{"1":"揣"},"shuai":{"4":"帅"},"wai":{"4":"外"},"dui":{"4":"对"},"tui":{"1":"推","3":"腿"},"gui":{"4":"贵"},"kui":{"1":"亏"},"hui":{"2":"回","4":"会"},"zhui":{"1":"追"},"chui":{"1":"吹"},"shui":{"3":"水","4":"睡"},"rui":{"1":"瑞"},"zui":{"3":"嘴","4":"最"},"cui":{"1":"催"},"sui":{"4":"岁"},"wei":{"4":"喂"},"duan":{"3":"短","4":"段"},"tuan":{"1":"团"},"nuan":{"3":"暖"},"luan":{"4":"乱"},"guan":{"1":"关","3":"管"},"kuan":{"1":"宽"},"huan":{"2":"还","4":"换"},"zhuan":{"3":"转"},"chuan":{"1":"穿","2":"船"},"shuan":{"1":"拴"},"ruan":{"1":"软"},"zuan":{"1":"钻"},"cuan":{"1":"窜"},"suan":{"1":"酸","4":"算"},"wan":{"2":"玩","3":"晚","4":"万"},"juan":{"4":"卷"},"quan":{"2":"全"},"xuan":{"3":"选"},"yuan":{"2":"元","3":"远"},"dun":{"1":"顿"},"tun":{"1":"吞"},"lun":{"1":"论"},"gun":{"1":"滚"},"kun":{"1":"困"},"hun":{"1":"婚"},"zhun":{"1":"准"},"chun":{"1":"春"},"shun":{"1":"顺"},"run":{"1":"润"},"zun":{"1":"尊"},"cun":{"1":"村"},"sun":{"1":"孙"},"wen":{"2":"闻","4":"问"},"jun":{"1":"军"},"qun":{"1":"群"},"xun":{"1":"寻"},"yun":{"1":"云"},"guang":{"1":"光","4":"逛"},"kuang":{"1":"况"},"huang":{"2":"黄"},"zhuang":{"1":"装"},"chuang":{"2":"床"},"shuang":{"1":"双"},"wang":{"3":"往","4":"忘"},"nüe":{"1":"虐"},"lüe":{"1":"略"},"jue":{"1":"觉"},"que":{"1":"缺","4":"却"},"xue":{"2":"学","3":"雪"},"yue":{"1":"约","4":"月"},"er":{"2":"而"}};
