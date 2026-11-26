/* Engine dùng chung cho hsk1 / hsk2 / hsk3 / hsk4-thuong / hsk4-ha.
   Trang học phải khai báo let currentLevel trước khi nạp file này (1, 2, 3, 4 hoặc '4x'). */

let lessons=[];

let activeLesson=0,activeTab='vocab',lastPractice='guess',currentGame=null,pinyinVisible=true,flashDeck=[],flashIndex=0,dictationIndex=0,dictationScore=0,dictationResults=[],dictationAttempts=[],dictationRevealed=false,fillIndex=0,fillScore=0,fillResults=[],fillAttempts=[],fillRevealed=false,game=null,gameRaf=0,gameTimer=0,tower=null,towerRaf=0,towerTimer=0,strokeRun=0,strokePlaying=false,strokeSkip=false;
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function speak(text){if(!('speechSynthesis'in window))return; stopAllOrigAudio(false);speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.78;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/^zh(-|_)?CN/i.test(v.lang))||vs.find(v=>/^zh/i.test(v.lang))||null;speechSynthesis.speak(u)}
const origAudios=new Set();
function registerOrigAudio(a){if(a&&!origAudios.has(a))origAudios.add(a)}
function stopAllOrigAudio(reset){origAudios.forEach(a=>{try{a.pause();if(reset)a.currentTime=0}catch(err){}});document.querySelectorAll('audio.orig-audio').forEach(a=>{registerOrigAudio(a);try{a.pause();if(reset)a.currentTime=0}catch(err){}})}
function origAudioHTML(src,label){return `<div class="orig-audio-box"><div class="orig-audio-label">${label}</div><audio class="orig-audio" controls preload="metadata" src="${src}"></audio></div>`}
// Đồng bộ audio gốc -> hoạt cảnh (chỉ bài có mốc trong sceneSync3/sceneSync4/sceneSyncX).
// NGUYÊN TẮC AN TOÀN: chỉ vẽ lại #sceneStep qua updateScene(), KHÔNG vẽ lại cả panel,
// vì vẽ lại panel sẽ tạo lại thẻ <audio> và làm mất tiếng đang chạy.
function sceneSyncStarts(){let data=null;if(currentLevel===1&&typeof sceneSync1!=="undefined")data=sceneSync1;else if(currentLevel===2&&typeof sceneSync2!=="undefined")data=sceneSync2;else if(currentLevel===3&&typeof sceneSync3!=="undefined")data=sceneSync3;else if(currentLevel===4&&typeof sceneSync4!=="undefined")data=sceneSync4;else if(isXia()&&typeof sceneSyncX!=="undefined")data=sceneSyncX;if(!data)return null;const byLesson=data[String(sceneLesson)];if(!byLesson)return null;return byLesson[sceneState.scene]||null}
function sceneSyncIndex(starts,t){if(!starts||!starts.length)return 0;let lo=0,hi=starts.length-1,idx=0;while(lo<=hi){const mid=(lo+hi)>>1;if(starts[mid]<=t){idx=mid;lo=mid+1}else hi=mid-1}return idx}
function sceneSyncAudio(){const box=document.getElementById('sceneBox');if(!box)return null;return box.querySelector('audio.orig-audio')}
function syncSceneToAudio(a){const starts=sceneSyncStarts();if(!starts)return;if(a!==sceneSyncAudio())return;const idx=sceneSyncIndex(starts,a.currentTime||0);if(idx!==sceneState.step){sceneState.step=idx;updateScene()}}
document.addEventListener('timeupdate',e=>{const a=e.target;if(a&&a.classList&&a.classList.contains('orig-audio'))syncSceneToAudio(a)},true);
document.addEventListener('seeked',e=>{const a=e.target;if(a&&a.classList&&a.classList.contains('orig-audio'))syncSceneToAudio(a)},true);
document.addEventListener('play',e=>{const a=e.target;if(!a||!a.classList||!a.classList.contains('orig-audio'))return;registerOrigAudio(a);origAudios.forEach(o=>{if(o!==a&&!o.paused){try{o.pause()}catch(err){}}});document.querySelectorAll('audio.orig-audio').forEach(o=>{if(o!==a&&!o.paused){try{o.pause()}catch(err){}}});if('speechSynthesis'in window)speechSynthesis.cancel()},true);
const sceneSpeakers={"李老师":{py:"Lǐ lǎoshī",face:"🧑"},"同学":{"py":"Tóngxué","face":"🧑"},"杨同乐":{py:"Yáng Tónglè",face:"🧑"},"王一雪":{py:"Wáng Yīxuě",face:"👩"},"同事":{py:"Tóngshì",face:"👤"},"刘明":{py:"Liú Míng",face:"👨"},"刘小明":{py:"Liú Xiǎomíng",face:"👦"},"李文":{py:"Lǐ Wén",face:"👨"},"白家月":{py:"Bái Jiāyuè",face:"👩"},"安妮":{py:"Ānnī",face:"👩"},"陈老师":{py:"Chén lǎoshī",face:"🧑‍🏫"},"王小文":{py:"Wáng Xiǎowén",face:"👧"},"李大伟":{py:"Lǐ Dàwěi",face:"👦"},"赵经理":{py:"Zhào jīnglǐ",face:"🧑‍💼"},"林小雨":{py:"Lín Xiǎoyǔ",face:"👩"},"张小强":{py:"Zhāng Xiǎoqiáng",face:"👨"},"王一飞":{py:"Wáng Yīfēi",face:"👨"},"刘小雪":{"py":"Liú Xiǎoxuě","face":"👧"},"服务员":{"py":"Fúwùyuán","face":"🧑‍🍳"},"陈天中":{"py":"Chén Tiānzhōng","face":"👨"},"张阿姨":{"py":"Zhāng āyí","face":"👩"},"李叔叔":{"py":"Lǐ shūshu","face":"👨"},"小李":{"py":"Xiǎo Lǐ","face":"🧑‍✈️"},"店员":{"py":"Diànyuán","face":"🧑"}};
const sceneSpeakersAlt={"15":{"杨同乐":{py:"Yáng Tónglè",face:"👨"},"刘小明":{py:"Liú Xiǎomíng",face:"🧒"}}};
Object.assign(sceneSpeakers,{"妈妈":{"py":"Māma","face":"👩"},"爸爸":{"py":"Bàba","face":"👨"},"爷爷":{"py":"Yéye","face":"👴"},"奶奶":{"py":"Nǎinai","face":"👵"},"老师":{"py":"Lǎoshī","face":"🧑‍🏫"},"教练":{"py":"Jiàoliàn","face":"🧢"},"顾客":{"py":"Gùkè","face":"🧑"},"售货员":{"py":"Shòuhuòyuán","face":"🧑‍💼"},"司机":{"py":"Sījī","face":"🧑‍✈️"},"导游":{"py":"Dǎoyóu","face":"🧑‍🦰"},"姐姐":{"py":"Jiějie","face":"👩"}});
Object.assign(sceneSpeakers,{"房东":{py:"Fángdōng",face:"🧓"},"护士":{py:"Hùshi",face:"👩‍⚕️"},"医生":{py:"Yīshēng",face:"🧑‍⚕️"},"邻居":{py:"Línjū",face:"👵"},"路人":{py:"Lùrén",face:"🧍"},"广播":{py:"Guǎngbō",face:"📢"},"值机员":{py:"Zhíjīyuán",face:"👩‍✈️"}});
Object.assign(sceneSpeakers,{"学生们":{py:"Xuéshengmen",face:"👥"},"小语":{py:"Xiǎoyǔ",face:"🤖"},"胡医生":{py:"Hú yīshēng",face:"🧑‍⚕️"},"刘爷爷":{py:"Liú yéye",face:"👴"},"白家月和安妮":{py:"Bái Jiāyuè hé Ānnī",face:"👭"}});
let __avClip = 0;
const AVATAR_CFG = {
  '白家月': ['sang', 'dai', 'den', '#A54432', 'earrings'],
  '陈天中': ['sang', 'ngan', 'den', '#193B39', ''],
  '李文': ['trung', 'ngan', 'den', '#2C4A6B', ''],
  '杨同乐': ['sang', 'spiky', 'den', '#B98A2F', ''],
  '王一雪': ['sang', 'bob', 'den', '#A54432', 'earrings'],
  '王一飞': ['trung', 'ngan', 'den', '#2E7D6B', ''],
  '刘明': ['sang', 'ngan', 'den', '#69766C', 'glasses'],
  '李老师': ['trung', 'ngan', 'den', '#193B39', 'glasses'],
  '刘小明': ['sang', 'ngan', 'den', '#2E7D6B', ''],
  '刘小雪': ['sang', 'dai', 'den', '#B98A2F', 'earrings'],
  '安妮': ['sang', 'bob', 'nau-sang', '#A54432', 'earrings'],
  '陈老师': ['trung', 'bui', 'den', '#193B39', 'glasses'],
  '王小文': ['sang', 'bob', 'den', '#2E7D6B', ''],
  '张小强': ['trung', 'spiky', 'den', '#2C4A6B', ''],
  '李大伟': ['ngam', 'ngan', 'den', '#B98A2F', ''],
  '林小雨': ['sang', 'dai', 'nau-dam', '#2E7D6B', 'earrings'],
  '赵经理': ['trung', 'ngan', 'den', '#193B39', 'glasses'],
  '同学': ['sang', 'ngan', 'den', '#69766C', ''],
  '同事': ['trung', 'bob', 'den', '#A54432', ''],
  '房东': ['ngam', 'ngan', 'xam', '#69766C', 'glasses'],
  '护士': ['sang', 'mu-yta', 'den', '#2E7D6B', ''],
  '路人': ['trung', 'mu-luoi-trai', 'den', '#2C4A6B', ''],
  '邻居': ['sang', 'bob', 'xam', '#69766C', ''],
  '张阿姨': ['trung', 'bui', 'xam', '#A54432', 'earrings'],
  '李叔叔': ['ngam', 'ngan', 'xam', '#193B39', ''],
  '服务员': ['sang', 'ngan', 'den', '#2C4A6B', ''],
  '小李': ['trung', 'ngan', 'den', '#2C4A6B', ''],
  '店员': ['sang', 'bob', 'nau-dam', '#B98A2F', ''],
  '售货员': ['sang', 'bob', 'nau-dam', '#B98A2F', ''],
  '妈妈': ['trung', 'bui', 'den', '#2E7D6B', ''],
  '广播': ['sang', 'ngan', 'den', '#2C4A6B', ''],
  '值机员': ['sang', 'bui', 'den', '#2C4A6B', ''],
  '学生们': ['sang', 'ngan', 'den', '#69766C', ''],
  '小语': ['sang', 'bob', 'den', '#A54432', 'earrings'],
  '胡医生': ['trung', 'ngan', 'den', '#2E7D6B', 'glasses'],
  '刘爷爷': ['ngam', 'ngan', 'xam', '#69766C', 'glasses'],
  '白家月和安妮': ['sang', 'bob', 'den', '#A54432', 'earrings']
};
function avatarSVG(name) {
  const INK = '#193B39', VERM = '#A54432', GOLD = '#B98A2F', NAVY = '#2C4A6B', BG = '#EDF1E8';
  const SKIN = { sang: '#F6D7C4', trung: '#EFC39E', ngam: '#D9A06F' };
  const HAIR = { den: '#232323', 'nau-dam': '#4A3226', xam: '#9AA0A6', 'nau-sang': '#C89B6A' };
  const cfg = AVATAR_CFG[name] || ['trung', 'ngan', 'den', '#69766C', ''];
  const skin = SKIN[cfg[0]], hc = HAIR[cfg[2]], top = cfg[3], style = cfg[1], extra = cfg[4];
  let back = '', topHair = '';
  if (style === 'dai') back = '<path d="M30 66 C26 20 94 20 90 66 L90 104 L30 104 Z" fill="' + hc + '"/>';
  if (style === 'bob') back = '<path d="M30 66 C26 20 94 20 90 66 L90 88 L30 88 Z" fill="' + hc + '"/>';
  if (style === 'ngan' || style === 'dai' || style === 'bob')
    topHair = '<path d="M31 64 C29 28 91 28 89 64 C84 46 74 40 60 40 C46 40 36 46 31 64 Z" fill="' + hc + '"/>';
  if (style === 'spiky')
    topHair = '<path d="M31 62 L36 34 L44 48 L52 30 L60 46 L68 30 L76 48 L84 34 L89 62 C84 46 74 40 60 40 C46 40 36 46 31 62 Z" fill="' + hc + '"/>';
  if (style === 'bui')
    topHair = '<path d="M31 64 C29 28 91 28 89 64 C84 46 74 40 60 40 C46 40 36 46 31 64 Z" fill="' + hc + '"/><circle cx="60" cy="22" r="11" fill="' + hc + '"/>';
  if (style === 'mu-yta')
    topHair = '<path d="M31 64 C29 30 91 30 89 64 C84 48 74 42 60 42 C46 42 36 48 31 64 Z" fill="' + hc + '"/><rect x="42" y="16" width="36" height="18" rx="8" fill="#FFFEFA" stroke="#D8DCC9" stroke-width="1.5"/><path d="M60 19 v12 M54 25 h12" stroke="' + VERM + '" stroke-width="3" stroke-linecap="round"/>';
  if (style === 'mu-luoi-trai')
    topHair = '<path d="M31 64 C29 30 91 30 89 64 C84 48 74 42 60 42 C46 42 36 48 31 64 Z" fill="' + hc + '"/><path d="M30 44 Q60 20 90 44 L90 52 Q60 32 30 52 Z" fill="' + NAVY + '"/><ellipse cx="60" cy="52" rx="34" ry="6" fill="' + NAVY + '"/>';
  let inner = back
    + '<ellipse cx="60" cy="134" rx="36" ry="30" fill="' + top + '"/>'
    + '<rect x="53" y="76" width="14" height="16" fill="' + skin + '"/>'
    + '<circle cx="30" cy="62" r="7" fill="' + skin + '"/><circle cx="90" cy="62" r="7" fill="' + skin + '"/>'
    + '<ellipse cx="60" cy="58" rx="27" ry="31" fill="' + skin + '"/>' + topHair;
  if (extra === 'glasses')
    inner += '<g stroke="' + INK + '" stroke-width="2.5" fill="none"><circle cx="49" cy="60" r="9"/><circle cx="71" cy="60" r="9"/><path d="M58 60 H62"/></g>';
  if (extra === 'earrings')
    inner += '<circle cx="31" cy="73" r="2.6" fill="' + GOLD + '"/><circle cx="89" cy="73" r="2.6" fill="' + GOLD + '"/>';
  inner += '<g fill="' + INK + '"><ellipse cx="49" cy="60" rx="2.6" ry="3.2"/><ellipse cx="71" cy="60" rx="2.6" ry="3.2"/></g>'
    + '<g stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M44 50 Q49 47 54 50"/><path d="M66 50 Q71 47 76 50"/><path d="M53 74 Q60 79 67 74"/></g>';
  const id = 'avclip' + (++__avClip);
  return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + name + '">'
    + '<defs><clipPath id="' + id + '"><circle cx="60" cy="60" r="58"/></clipPath></defs>'
    + '<circle cx="60" cy="60" r="58" fill="' + BG + '"/><g clip-path="url(#' + id + ')">' + inner + '</g></svg>';
}

function isXia(){return currentLevel==='4x'}
function is4(){return currentLevel===4||currentLevel==='4x'}
function curSceneData(){return isXia()?sceneDataX:currentLevel===4?sceneData4:sceneData}
function curSceneStates(){return isXia()?sceneStatesX:currentLevel===4?sceneStates4:sceneStates}
function curDict(){return isXia()?dictationsX:currentLevel===4?dictations4:dictations}
function sceneSourceHTML(){if(isXia())return '<span class="scene-source">Đối chiếu giáo trình 《新HSK教程4下》</span>';if(currentLevel===4)return '<span class="scene-source">Đối chiếu giáo trình 《新HSK教程4上》</span>';if(currentLevel===1)return '<span class="scene-source">Đối chiếu giáo trình 《新HSK教程1》</span>';if(currentLevel===2)return '<span class="scene-source">Đối chiếu giáo trình 《新HSK教程2》</span>';return '<span class="scene-source">Đối chiếu giáo trình 《新HSK教程3》</span>'}
let mcqAnswers={};
function mcqQuestionHTML(num,sceneIdx,qi,q){const key=num+'-'+sceneIdx+'-'+qi;const sel=mcqAnswers[key];return `<div class="mcq-q"><div class="mcq-qtext"><strong>${qi+1}. ${esc(q.q)}</strong>${q.py?`<div class="pinyin">${esc(q.py)}</div>`:''}</div><div class="mcq-opts">${q.options.map((o,i)=>`<button type="button" class="mcq-opt${sel===i?(i===q.answer?' correct':' wrong'):''}${sel!==undefined&&i===q.answer?' answer':''}" data-mcq="${esc(key)}" data-opt="${i}"><span class="mcq-letter">${'ABCD'[i]}</span> ${esc(o)}</button>`).join('')}</div>${sel!==undefined?`<p class="mcq-feedback ${sel===q.answer?'ok':'bad'}">${sel===q.answer?'✓ Đúng rồi.':'✗ Chưa đúng — đáp án đúng là '+ 'ABCD'[q.answer] + '.'} ${esc(q.explain||'')}</p>`:''}</div>`}
function mcqHTML(num){const data=currentLevel===1?(typeof textQuiz1!=="undefined"?textQuiz1[num]:null):currentLevel===2?(typeof textQuiz2!=="undefined"?textQuiz2[num]:null):currentLevel===3?(typeof textQuiz3!=="undefined"?textQuiz3[num]:null):(typeof textQuiz4!=="undefined")?textQuiz4[num]:(typeof textQuizX!=="undefined")?textQuizX[num]:null;if(!data)return '';let total=0,correct=0;data.forEach((scene,si)=>scene.qs.forEach((q,qi)=>{total++;if(mcqAnswers[num+'-'+si+'-'+qi]===q.answer)correct++}));const si=(typeof sceneState!=='undefined'&&sceneState)?sceneState.scene:0;const scene=data[si]||data[0];const sceneIdx=data.indexOf(scene);if(!scene.qs||!scene.qs.length)return '';let sceneCorrect=0;scene.qs.forEach((q,qi)=>{if(mcqAnswers[num+'-'+sceneIdx+'-'+qi]===q.answer)sceneCorrect++});return `<article class="info-card mcq-card"><h3>Trắc nghiệm bài khóa · Nghe rồi chọn đáp án đúng</h3><div class="mcq-score">Cảnh này: <strong>${sceneCorrect}/${scene.qs.length}</strong> · Cả bài: <strong>${correct}/${total}</strong></div><div class="mcq-scene"><h4>${esc(scene.title)}</h4>${scene.qs.map((q,qi)=>mcqQuestionHTML(num,sceneIdx,qi,q)).join('')}</div></article>`}
function fullTextSceneHTML(sc,i){const names=Object.keys(sc.sides),mono=names.length===1&&sc.sides[names[0]]==='C',cls=n=>['fulltext-name-a','fulltext-name-b','fulltext-name-c'][Math.max(0,names.indexOf(n))%3];const body=mono?`<p class="fulltext-para">${esc(sc.lines.map(l=>l[1]).join(''))}</p>`:sc.lines.map(l=>`<p class="fulltext-line"><span class="fulltext-speaker"><span class="fulltext-name ${cls(l[0])}">${esc(l[0])}</span></span>${esc(l[1])}</p>`).join('');return `<div class="fulltext-scene"><div class="fulltext-scene-head">课文${i+1}</div>${body}</div>`}
function fullTextHTML(num){const scenes=curSceneData()[num];if(!scenes)return '';const si=(typeof sceneState!=='undefined'&&sceneState)?sceneState.scene:0;const sc=scenes[si]||scenes[0];const i=scenes.indexOf(sc);return `<article class="info-card fulltext-card fulltext-page">${fullTextSceneHTML(sc,i)}</article>`}
function fullTextAllHTML(num){const scenes=curSceneData()[num];if(!scenes)return '';return `<article class="info-card fulltext-card fulltext-card-hand"><h3>Luyện đọc hành thư</h3>${scenes.map((sc,i)=>fullTextSceneHTML(sc,i)).join('')}</article>`}
function renderAnalysis(){const l=lessons[activeLesson],d=is4()?(isXia()?analysisDetailsX:analysisDetails4)[l.num]:{structures:l.structures||[],natural:l.natural||[]};analysisPanel.innerHTML=`<div class="stack">${scenePlayerHTML(l.num)}${mcqHTML(l.num)}${fullTextHTML(l.num)}${d&&d.structures&&d.structures.length?`<article class="info-card"><h3>Cấu trúc hay nên nhớ</h3><div class="structure-list">${d.structures.map(s=>`<div class="structure"><div class="han">${esc(s.han)}</div><div class="pinyin">${esc(s.pinyin)}</div><strong>${esc(s.meaning)}</strong>${s.note?`<div class="note">${esc(s.note)}</div>`:''}</div>`).join('')}</div></article>`:''}${d&&d.natural&&d.natural.length?`<article class="info-card"><h3>Người Trung Quốc có nói vậy không?</h3><ul class="natural-list">${d.natural.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`:''}${fullTextAllHTML(l.num)}</div>`}
function markStreak(){if(typeof Streak!=="undefined"&&typeof Streak.qualify==="function")Streak.qualify()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-mcq]');if(!b)return;const key=b.dataset.mcq;if(mcqAnswers[key]!==undefined)return;mcqAnswers[key]=+b.dataset.opt;markStreak();lbQuizCheck(key.split('-')[0]);renderAnalysis()});
let sceneState={scene:0,step:0},sceneLesson=13;const sceneStates={"1":{scene:0,step:0},"2":{scene:0,step:0},"3":{scene:0,step:0},"4":{scene:0,step:0},"5":{scene:0,step:0},"6":{scene:0,step:0},"7":{scene:0,step:0},"8":{scene:0,step:0},"9":{scene:0,step:0},"10":{scene:0,step:0},"11":{scene:0,step:0},"12":{scene:0,step:0},"13":sceneState,"14":{scene:0,step:0},"15":{scene:0,step:0},"16":{scene:0,step:0},"17":{scene:0,step:0},"18":{scene:0,step:0}};
function scenePlayerHTML(num){num=num||13;if(num!==sceneLesson){sceneLesson=num;sceneState=curSceneStates()[num]}return `<article class="scene-wrap" id="sceneBox">${sceneInnerHTML()}</article>`}
function audioBaseForLevel(){return currentLevel===1?"assets/audio/h1/":currentLevel===2?"assets/audio/h2/":currentLevel===3?"assets/audio/h3/":"assets/audio/h4/"}
function sceneAudioHTML(){const k=sceneState.scene,tracks=currentLevel===1?(typeof audioTracks1!=="undefined"?audioTracks1[sceneLesson]:null):currentLevel===2?(typeof audioTracks2!=="undefined"?audioTracks2[sceneLesson]:null):currentLevel===3?(typeof audioTracks3!=="undefined"?audioTracks3[sceneLesson]:null):isXia()?(typeof audioTracksX!=="undefined"?audioTracksX[sceneLesson]:null):(typeof audioTracks4!=="undefined"?audioTracks4[sceneLesson]:null);if(!tracks||!tracks[2*k])return "";return origAudioHTML(audioBaseForLevel()+tracks[2*k],`Nghe bài khoá gốc ${sceneLesson}-${2*k+1}`)}
function sceneInnerHTML(){const sc=curSceneData()[sceneLesson][sceneState.scene],line=sc.lines[sceneState.step],total=sc.lines.length,monoNames=Object.keys(sc.sides),mono=monoNames.length===1&&sc.sides[monoNames[0]]==='C';const sideHTML=side=>Object.keys(sc.sides).filter(n=>sc.sides[n]===side).map(n=>{const sp=(sceneSpeakersAlt[sceneLesson]&&sceneSpeakersAlt[sceneLesson][n])||sceneSpeakers[n];return `<div class="scene-ava ${n===line[0]?'active':''}"><div class="face" role="img" aria-label="${esc(n)}">${avatarSVG(n)}</div><div class="sname">${esc(n)}</div><div class="spy">${esc(sp.py)}</div></div>`}).join('');return `<div class="scene-head"><h3>Hoạt cảnh hội thoại · Bài ${sceneLesson}</h3>${sceneSourceHTML()}</div><div class="scene-tabs">${curSceneData()[sceneLesson].map((s,i)=>`<button class="scene-tab ${i===sceneState.scene?'active':''}" data-scene-tab="${i}">${esc(s.label)}</button>`).join('')}</div>${sceneAudioHTML()}<div id="sceneStep">${sceneStepHTML()}</div>`}
function sceneStepHTML(){const sc=curSceneData()[sceneLesson][sceneState.scene],line=sc.lines[sceneState.step],total=sc.lines.length,monoNames=Object.keys(sc.sides),mono=monoNames.length===1&&sc.sides[monoNames[0]]==='C';const sideHTML=side=>Object.keys(sc.sides).filter(n=>sc.sides[n]===side).map(n=>{const sp=(sceneSpeakersAlt[sceneLesson]&&sceneSpeakersAlt[sceneLesson][n])||sceneSpeakers[n];return `<div class="scene-ava ${n===line[0]?'active':''}"><div class="face" role="img" aria-label="${esc(n)}">${avatarSVG(n)}</div><div class="sname">${esc(n)}</div><div class="spy">${esc(sp.py)}</div></div>`}).join('');return `<div class="scene-head" style="margin-top:14px"><span class="scene-context">Bối cảnh: ${esc(sc.context)} (${esc(sc.contextZh)})</span><span class="scene-step">Bước ${sceneState.step+1} / ${total}</span></div>${mono?`<div class="scene-stage mono"><div class="scene-side center">${sideHTML('C')}</div>`:`<div class="scene-stage"><div class="scene-side">${sideHTML('L')}</div>`}<div class="scene-card"><div class="scene-speaker">${esc(line[0])}</div><div class="scene-zh">${esc(line[1])}</div><div class="scene-py pinyin">${esc(line[2])}</div><div class="scene-vi">${esc(line[3])}</div><div class="scene-actions"><button class="scene-listen" data-read="${esc(line[1])}" data-speaker="${esc(line[0])}">Nghe câu này</button>${line[4]?`<span class="scene-tip">${esc(line[4])}</span>`:''}</div></div>${mono?'':`<div class="scene-side">${sideHTML('R')}</div>`}</div><div class="scene-controls"><button class="scene-navbtn" id="scenePrev" ${sceneState.step===0?'disabled':''}>‹ Câu trước</button><button class="scene-navbtn next" id="sceneNext" ${sceneState.step===total-1?'disabled':''}>Câu tiếp ›</button></div>`}
function updateScene(){const st=document.getElementById("sceneStep");if(st){st.innerHTML=sceneStepHTML();return}const box=document.getElementById("sceneBox");if(box)box.innerHTML=sceneInnerHTML()}
function sceneGo(d){const sc=curSceneData()[sceneLesson][sceneState.scene],n=sceneState.step+d;if(n<0||n>=sc.lines.length)return;sceneState.step=n;updateScene();const a=sceneSyncAudio(),starts=sceneSyncStarts();if(a&&starts&&starts[n]!==undefined){try{a.currentTime=starts[n]}catch(err){}}}
document.addEventListener('click',e=>{if(e.target.closest('[data-lesson],[data-tab]')){stopAllOrigAudio(true);return}const tb=e.target.closest('[data-scene-tab]');if(tb){stopAllOrigAudio(true);sceneState.scene=+tb.dataset.sceneTab;sceneState.step=0;renderAnalysis();return}if(e.target.id==='scenePrev'){sceneGo(-1);return}if(e.target.id==='sceneNext'){sceneGo(1);return}});
function hySay(tag,html,mood){if(window.HaiYing3D&&typeof HaiYing3D.say==='function')HaiYing3D.say(tag,html,mood)}
function renderNav(){lessonNav.innerHTML=lessons.map((l,i)=>`<button class="lesson-btn ${i===activeLesson?'active':''}" data-lesson="${i}"><span class="n">${l.num}</span><span>${esc(l.han)}</span></button>`).join('')}
function renderHead(){const l=lessons[activeLesson];let src;if(is4()){src='<p class="source-line">Nội dung đối chiếu theo giáo trình 《新HSK教程4'+(isXia()?'下':'上')+'》 — quyển '+(isXia()?'hạ':'thượng')+'.</p>'}else if(currentLevel===1||currentLevel===2){src='<p class="source-line">Nội dung đối chiếu theo giáo trình 《新HSK教程'+currentLevel+'》.</p>'}else{const t=lessonTexts[l.num];src=(t&&t.url)?'<p class="source-line">Nội dung đối chiếu từ <a href="'+t.url+'" target="_blank" rel="noopener noreferrer">web Bài '+l.num+' của cô Hà Hằng ↗</a></p>':''}lessonHead.innerHTML=`<div class="lesson-kicker"><span class="seal-mini">课</span> Bài ${l.num} · ${esc(l.theme)}</div><h2>${esc(l.han)}</h2><div class="lesson-pinyin pinyin">${esc(l.pinyin)}</div><p>${esc(l.translation)}</p>${src}`;const cr=document.getElementById('studyCrumb');if(cr)cr.textContent=(is4()?('HSK 4 · Quyển '+(isXia()?'hạ':'thượng')):currentLevel===1?'HSK 1':currentLevel===2?'HSK 2':'HSK 3')+' · Bài '+l.num}
function vocabCard(v,i){const photo=vocabPhoto(i);return `<article class="vocab-card${v.star?' vocab-beyond-card':''}"><div class="vocab-media"><img class="vocab-photo" src="${photo}" alt="Ảnh minh họa ${esc(v.word)} — ${esc(v.meaning)}" loading="lazy" decoding="async" onerror="this.classList.add('broken');this.parentElement.classList.add('no-photo')"><span class="vocab-photo-fallback" aria-hidden="true">${esc(v.word.charAt(0))}</span></div><div class="vocab-body"><div class="vocab-top"><div><div class="word">${esc(v.word)}${v.star?' <span class="vocab-beyond">Vượt cấp</span>':''}</div><div class="pinyin">${esc(v.pinyin)}</div><span class="pos">${esc(v.pos)}</span></div><button class="speak" data-speak="${i}" aria-label="Nghe ${esc(v.word)}">▶</button></div><p class="meaning">${esc(v.meaning)}</p></div><details class="example"><summary>Xem câu ví dụ</summary><p class="han">${esc(v.example)}</p><p class="example-pinyin pinyin">${esc(v.examplePinyin)}</p><p class="vi">${esc(v.exampleVi)}</p></details></article>`}
/* ===== Học từng từ (thí điểm: HSK3 Bài 10) — 2 màn hình cho tab Từ vựng =====
 * Màn Tổng quan: chọn nhóm + audio gốc của nhóm + bảng từ gọn + nút Bắt đầu học.
 * Màn Học từng từ: 1 từ/lần, dùng lại thẻ từ, ví dụ, bút thuận hiện có.
 * URL chi tiết: /hsk3/10/tu-vung?g=<nhóm>&w=<vị trí trong nhóm>. */
let vGroup=0,vFocus={on:false,g:0,w:0},vLessonStamp=null,vStrokeRun=0,vQuiz=null;
const V_ICON_VOL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
const V_ICON_BOOK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
const V_ICON_CHEV='<svg class="ex-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const V_ICON_LIST='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>';
const V_ICON_PENCIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>';
function setWriteMode(id){['vWriteBtn','vQuizBtn'].forEach(x=>{const b=$('#'+x);if(b){const on=x===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')}})}
function vocabGroupsData(){return currentLevel===1?(typeof vocabGroups1!=="undefined"?vocabGroups1:null):currentLevel===2?(typeof vocabGroups2!=="undefined"?vocabGroups2:null):currentLevel===3?(typeof vocabGroups3!=="undefined"?vocabGroups3:null):isXia()?(typeof vocabGroupsX!=="undefined"?vocabGroupsX:null):(typeof vocabGroups4!=="undefined"?vocabGroups4:null)}
function vocabTracksData(){return currentLevel===1?(typeof audioTracks1!=="undefined"?audioTracks1:null):currentLevel===2?(typeof audioTracks2!=="undefined"?audioTracks2:null):currentLevel===3?(typeof audioTracks3!=="undefined"?audioTracks3:null):isXia()?(typeof audioTracksX!=="undefined"?audioTracksX:null):(typeof audioTracks4!=="undefined"?audioTracks4:null)}
function isVocabFlow(){const l=lessons[activeLesson];if(!l)return false;const d=vocabGroupsData();return(!!d&&!!d[l.num])||isXia()}
function vocabGroupsCur(){const l=lessons[activeLesson];const d=vocabGroupsData();if(d&&d[l.num])return d[l.num];return [l.vocab.map((v,i)=>i)]}
function resetVocabState(num){vLessonStamp=num;vGroup=0;vFocus={on:false,g:0,w:0}}
function syncVocabFromUrl(view){const l=lessons[activeLesson];if(!l)return;if(vLessonStamp!==l.num)resetVocabState(l.num);if(view!=='tu-vung'||!isVocabFlow()){vFocus={on:false,g:vGroup,w:0};return}const sp=new URLSearchParams(location.search);const g=parseInt(sp.get('g'),10),w=parseInt(sp.get('w'),10);const groups=vocabGroupsCur();if(Number.isInteger(g)&&Number.isInteger(w)&&groups[g]&&w>=0&&w<groups[g].length){vGroup=g;vFocus={on:true,g:g,w:w}}else vFocus={on:false,g:vGroup,w:0}}
function scrollVocabTop(){const el=document.getElementById('vocabPanel');if(!el)return;const y=el.getBoundingClientRect().top+window.scrollY-8;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}
function enterFocus(g,w){stopAllOrigAudio(false);cancelFocusWriting();vGroup=g;vFocus={on:true,g:g,w:w};markStreak();pushRoute();renderVocab();scrollVocabTop()}
function exitFocus(){cancelFocusWriting();vGroup=vFocus.g;vFocus={on:false,g:vFocus.g,w:0};pushRoute();renderVocab();scrollVocabTop()}
function moveFocus(d){const idxs=vocabGroupsCur()[vFocus.g];const w=Math.min(idxs.length-1,Math.max(0,vFocus.w+d));if(w===vFocus.w)return;stopAllOrigAudio(false);cancelFocusWriting();vFocus={on:true,g:vFocus.g,w:w};markStreak();pushRoute();renderVocab();scrollVocabTop()}
function vRowHTML(v,g,w,tag){return `<button class="v-row" data-vword="${g}:${w}"><span class="v-num">${w+1}</span><span class="v-han">${esc(v.word)}${v.star?' <span class="vocab-beyond">Vượt cấp</span>':''}</span><span class="pinyin">${esc(v.pinyin)}</span><span class="pos">${esc(v.pos)}</span><span class="v-vi">${esc(v.meaning)}${tag?` <span class="v-tag">${tag}</span>`:''}</span></button>`}
function renderVocabPilot(l){
  if(vLessonStamp!==l.num)resetVocabState(l.num);
  if(vFocus.on){renderVocabFocus(l);return}
  renderVocabOverview(l);
}
function renderVocabOverview(l){
  const groups=vocabGroupsCur();
  const g=Math.min(groups.length-1,Math.max(0,vGroup));vGroup=g;
  const idxs=groups[g];
  const tracks=vocabTracksData();
  const track=(tracks&&tracks[l.num])?tracks[l.num][2*g+1]:null;
  const audioBase=audioBaseForLevel();
  const multi=groups.length>1;
  const starCount=idxs.filter(vi=>l.vocab[vi]&&l.vocab[vi].star).length;
  if(activeTab==='vocab')hySay(`Từ vựng · Bài ${l.num}`,`Nhóm này có <strong>${idxs.length} từ mới</strong>${starCount?` (${starCount} từ ★ vượt cấp)`:''}. Bấm <strong>“Bắt đầu học từng từ”</strong> hoặc chạm vào từ bất kỳ để luyện viết cùng mình nhé!`,'wave');
  vocabPanel.innerHTML=`<div class="section-intro"><h3>Từ vựng trọng tâm</h3><span class="count">${l.vocab.length} từ${multi?` · ${groups.length} nhóm`:''}</span></div>`
    +(multi?`<div class="scene-tabs" role="group" aria-label="Chọn nhóm từ">${groups.map((_,k)=>`<button class="scene-tab${k===g?' active':''}" data-vgroup="${k}">Nhóm ${k+1}</button>`).join('')}</div>`:'')
    +`<div class="vocab-group">${multi?`<div class="group-head"><div class="group-title">Nhóm ${g+1}</div><div class="group-sub">${idxs.length} từ · Từ vựng của Bài khóa ${l.num}-${g+1}</div></div>`:''}`
    +(track?origAudioHTML(audioBase+track,`Nghe từ mới · Nhóm ${g+1}`):"")
    +`<div class="v-start-row"><button class="action" id="vStart">Bắt đầu học từng từ</button></div>`
    +`<div class="v-table">${idxs.map((vi,w)=>vRowHTML(l.vocab[vi],g,w,'')).join('')}</div></div>`;
}
function srsHas(v){return typeof SRS!=="undefined"&&SRS.has(v)}
function srsLoc(vi){const l=lessons[activeLesson];const groups=vocabGroupsCur();for(let g=0;g<groups.length;g++){const w=groups[g].indexOf(vi);if(w>=0)return {course:pageCourse(),lesson:l.num,g:g,w:w}}return {course:pageCourse(),lesson:l.num}}
function srsRecord(vi,skill,outcome,holder){if(typeof SRS==="undefined")return false;const l=lessons[activeLesson];const loc=srsLoc(vi);let tid=null;if(holder)tid=holder._tid||(holder._tid=SRS.turnId('srs'));return SRS.record({snap:SRS.snapshotOf(l.vocab[vi]),course:loc.course,lesson:loc.lesson,g:loc.g,w:loc.w,skill:skill,outcome:outcome,turnId:tid})}
function srsFillRecord(it){if(typeof SRS==="undefined")return;const l=lessons[activeLesson];const vi=l.vocab.findIndex(v=>v.word===it.answer);if(vi<0)return;srsRecord(vi,'hanzi','wrong',null)}
let lbDoneActs=null;
function lbAwardOnce(type,id,c,t){if(!window.LB)return;lbDoneActs=lbDoneActs||new Set();const k=type+':'+id;if(lbDoneActs.has(k))return;lbDoneActs.add(k);LB.award(type,id,c,t)}
function lbCourseKey(){return currentLevel===1?'hsk1':currentLevel===2?'hsk2':currentLevel===3?'hsk3':(isXia()?'hsk4-ha':'hsk4-thuong')}
function lbPracticeCheck(){if(!window.LB)return;const num=lessons[activeLesson].num;const dt=(curDict()[num]||[]).length;const dn=Object.keys(dictationResults).length;if(dt>0&&dn>=dt){let c=0;for(const k in dictationResults)if(dictationResults[k].correct)c++;lbAwardOnce('practice','dictation:'+lbCourseKey()+':'+num,c,dt)}const fi=fillItems();const fn=Object.keys(fillResults).length;if(fi.length>0&&fn>=fi.length){let c=0;for(const k in fillResults)if(fillResults[k].correct)c++;lbAwardOnce('practice','fill:'+lbCourseKey()+':'+num,c,fi.length)}}
function lbQuizCheck(num){if(!window.LB)return;const data=currentLevel===1?(typeof textQuiz1!=="undefined"?textQuiz1[num]:null):currentLevel===2?(typeof textQuiz2!=="undefined"?textQuiz2[num]:null):currentLevel===3?(typeof textQuiz3!=="undefined"?textQuiz3[num]:null):(typeof textQuiz4!=="undefined")?textQuiz4[num]:(typeof textQuizX!=="undefined")?textQuizX[num]:null;if(!data)return;let total=0,correct=0,answered=0;data.forEach((scene,si)=>scene.qs.forEach((q,qi)=>{total++;const a=mcqAnswers[num+'-'+si+'-'+qi];if(a!==undefined){answered++;if(a===q.answer)correct++}}));if(total>0&&answered>=total)lbAwardOnce('quiz','quiz:'+lbCourseKey()+':'+num,correct,total)}
function srsPracticeCheck(){if(typeof Streak==="undefined")return;const cnt=o=>{let n=0;for(const k in o){const r=o[k];if(r&&(r.correct||(r.typed&&String(r.typed).trim())))n++}return n};const n=Math.max(cnt(dictationResults),cnt(fillResults));if(n>=1)Streak.notePractice(n)}
function srsCtaHTML(){if(typeof SRS==="undefined")return "";const n=SRS.dueCount();return n?`<div class="srs-cta"><span>Hiện có <strong>${n}</strong> từ cần ôn</span><a class="action" href="/on-tap">Ôn các từ này</a></div>`:""}
function renderVocabFocus(l){
  const groups=vocabGroupsCur();
  const g=Math.min(groups.length-1,Math.max(0,vFocus.g));const idxs=groups[g];
  const w=Math.min(idxs.length-1,Math.max(0,vFocus.w));vFocus={on:true,g:g,w:w};
  const vi=idxs[w];const v=l.vocab[vi];
  let card=vocabCard(v,vi).replace('<details class="example">','<details class="example" open>');
  card=card.replace('▶',V_ICON_VOL);
  card=card.replace('<summary>Xem câu ví dụ</summary>','<summary>'+V_ICON_BOOK+'<span class="lbl-show">Xem câu ví dụ</span><span class="lbl-hide">Thu gọn ví dụ</span>'+V_ICON_CHEV+'</summary>');
  const last=w===idxs.length-1;
  const chars=[...v.word];
  if(activeTab==='vocab')hySay(`Từ ${w+1}/${idxs.length} · ${esc(v.word)}`,`<strong>${esc(v.word)}</strong> (${esc(v.pinyin)}) nghĩa là <strong>“${esc(v.meaning)}”</strong>.${v.star?' ★ Từ vượt cấp rất hay gặp!':''} Bấm <strong>Tập viết</strong> để luyện nét chữ nhé!`,'teach');
  vocabPanel.innerHTML=`<div class="v-focus-wrap"><button class="action" id="vBack">← Danh sách từ</button>`
    +`<div class="v-focus-head"><span class="group-title">${groups.length>1?`Nhóm ${g+1} · `:''}Bài ${l.num}</span><span class="count">Từ ${w+1}/${idxs.length}</span></div>`
    +`<div class="cn-track v-progress"><div class="cn-fill" style="width:${(w+1)/idxs.length*100}%"></div></div>`
    +`<div class="v-srs-row"><button class="v-srs${srsHas(v)?' added':''}" id="vSrsBtn" type="button"${srsHas(v)?' disabled':''}>${srsHas(v)?'Đã thêm vào Ôn tập':'Thêm vào ôn tập'}</button></div>`
    +card
    +`<div class="v-write"><div class="group-title">Luyện viết chữ Hán</div><div class="v-seg" role="group" aria-label="Chế độ luyện viết"><button class="v-seg-btn" id="vWriteBtn" aria-pressed="false">`+V_ICON_LIST+`<span>Thứ tự nét</span></button><button class="v-seg-btn" id="vQuizBtn" aria-pressed="false">`+V_ICON_PENCIL+`<span>Tập viết</span></button></div><div class="v-write-stage" id="vWriteStage">${chars.map(ch=>`<span class="v-char">${esc(ch)}</span>`).join('')}</div><p class="game-note" id="vWriteStatus">Chọn “Thứ tự nét” để xem nét bút mẫu, hoặc “Tập viết” để tự vẽ từng nét nhé!</p></div>`
    +`<div class="v-nav"><button class="game-other" id="vPrev" ${w===0?'disabled':''}>← Từ trước</button>${last?'':`<button class="action" id="vNext">Từ tiếp theo →</button>`}</div>`
    +(last?`<div class="score-card v-end"><span class="level-badge">${groups.length>1?`Hoàn thành nhóm ${g+1}`:`Hoàn thành bài ${l.num}`}</span><h3>Bạn đã học hết ${idxs.length} từ của ${groups.length>1?`nhóm ${g+1}`:`bài ${l.num}`}</h3><div class="v-end-actions"><button class="action" id="vAgain">${groups.length>1?'Học lại nhóm này':'Học lại bài này'}</button>${g<groups.length-1?`<button class="action" id="vNextGroup">Sang nhóm ${g+2} →</button>`:''}<button class="game-other" id="vList">Danh sách từ</button></div></div>`:'')
    +`</div>`;
}
async function animateFocusStrokes(){
  const stage=$('#vWriteStage');if(!stage||!vFocus.on)return;
  const l=lessons[activeLesson];const v=l.vocab[vocabGroupsCur()[vFocus.g][vFocus.w]];if(!v)return;
  markStreak();
  cancelFocusWriting();const run=vStrokeRun;const btn=$('#vWriteBtn');if(btn)btn.disabled=true;
  stage.innerHTML='';const chars=[...v.word];const size=chars.length===1?150:chars.length===2?120:96;
  try{
    if(typeof HanziWriter==='undefined')throw new Error('no-lib');
    for(const ch of chars){
      if(run!==vStrokeRun)return;
      const el=document.createElement('div');el.className='v-hw-cell';stage.appendChild(el);
      const w=HanziWriter.create(el,ch,{width:size,height:size,padding:6,strokeColor:'#15334d',outlineColor:'rgba(21,51,77,.18)',delayBetweenStrokes:80,strokeAnimationSpeed:2});
      await w.animateCharacter();
    }
  }catch(err){
    if(run===vStrokeRun)stage.innerHTML=chars.map(ch=>`<span class="v-char">${esc(ch)}</span>`).join('');
  }finally{
    if(run===vStrokeRun){const b=$('#vWriteBtn');if(b)b.disabled=false}
  }
}
function cancelFocusWriting(){vStrokeRun++;if(vQuiz){vQuiz.writers.forEach(w=>{try{if(w.cancelQuiz)w.cancelQuiz()}catch(err){}});vQuiz=null}['vWriteBtn','vQuizBtn'].forEach(id=>{const b=$('#'+id);if(b)b.disabled=false})}
async function startFocusQuiz(){
  const stage=$('#vWriteStage');if(!stage||!vFocus.on)return;
  const l=lessons[activeLesson];const v=l.vocab[vocabGroupsCur()[vFocus.g][vFocus.w]];if(!v)return;
  markStreak();
  cancelFocusWriting();const run=vStrokeRun;
  const setStatus=t=>{const s=$('#vWriteStatus');if(s)s.textContent=t};
  const chars=[...v.word];const size=chars.length===1?200:chars.length===2?150:110;
  stage.innerHTML='';
  if(typeof HanziWriter==='undefined'){stage.innerHTML=chars.map(ch=>`<span class="v-char">${esc(ch)}</span>`).join('');setStatus('Không tải được thư viện nét — kiểm tra mạng rồi thử lại nhé.');return}
  vQuiz={run:run,writers:[]};
  let totalMistakes=0;
  for(let ci=0;ci<chars.length;ci++){
    if(run!==vStrokeRun)return;
    const el=document.createElement('div');el.className='v-hw-cell';stage.appendChild(el);
    let w;
    try{
      w=HanziWriter.create(el,chars[ci],{width:size,height:size,padding:6,strokeColor:'#15334d',outlineColor:'rgba(21,51,77,.18)',drawingColor:'#A54432',drawingWidth:6});
    }catch(err){
      el.innerHTML=`<span class="v-char">${esc(chars[ci])}</span>`;continue;
    }
    vQuiz.writers.push(w);
    setStatus(`Tập viết chữ ${ci+1}/${chars.length} “${chars[ci]}” — bạn cứ đưa nét theo đúng thứ tự nhé.`);
    hySay(`Tập viết · ${chars[ci]}`,`Đưa nét theo thứ tự cho chữ <strong>“${chars[ci]}”</strong> (${ci+1}/${chars.length}) nhé!`,'teach');
    await new Promise(res=>{
      w.quiz({
        showHintAfterMisses:3,
        highlightOnComplete:true,
        onMistake:()=>{totalMistakes++;setStatus(`Nét này hơi lệch một chút — thử lại nhé! (đã sai ${totalMistakes} nét)`);hySay(`Cố lên!`,`Nét vừa rồi hơi lệch một chút, thử lại nhé!`,'think')},
        onCorrectStroke:(data)=>{markStreak();setStatus(`Chuẩn luôn! Đúng nét ${data.strokeNum}/${data.totalStrokes} của chữ “${chars[ci]}”.`)},
        onComplete:()=>res()
      });
    });
  }
  if(run!==vStrokeRun)return;
  vQuiz=null;
  markStreak();
  const vi=vocabGroupsCur()[vFocus.g][vFocus.w];
  const writePts=totalMistakes===0?3:totalMistakes<=2?2:totalMistakes===3?1:0;
  if(writePts>0&&window.LB){
    LB.award('practice','write:'+lbCourseKey()+':'+l.num+':'+vi,writePts,30);
  }
  const stEl=$('#vWriteStatus');
  if(writePts>0){
    const badge=` <span class="v-write-bonus">+${writePts} điểm BXH ⭐</span> · <a class="v-write-lblink" href="bang-xep-hang">Xem Bảng xếp hạng →</a>`;
    const msgDone=totalMistakes===0
      ?`Xuất sắc — bạn viết đúng hết “${esc(v.word)}”, không sai nét nào!`+badge
      :`Giỏi lắm! Bạn viết xong “${esc(v.word)}” chỉ với ${totalMistakes} nét sai.`+badge;
    if(stEl)stEl.innerHTML=msgDone;
    hySay(
      `+${writePts} điểm · ${esc(v.word)}`,
      totalMistakes===0
        ?`Tuyệt đỉnh! Bạn viết chuẩn <strong>“${esc(v.word)}”</strong> không sai nét nào và được cộng <strong>+${writePts} điểm</strong> vào tổng điểm! Ghé <a href="bang-xep-hang" class="hy3d-link">Bảng xếp hạng →</a> xem thứ hạng nhé!`
        :`Hoan hô! Bạn viết <strong>“${esc(v.word)}”</strong> rất ít nét sai (${totalMistakes} nét) và được cộng <strong>+${writePts} điểm</strong>! Vào <a href="bang-xep-hang" class="hy3d-link">Bảng xếp hạng →</a> xem ngay nhé!`,
      'cheer'
    );
  }else{
    const msgDone=`Hoàn thành! Bạn đã viết xong “${v.word}” với ${totalMistakes} nét sai. Bấm “Tập viết” luyện lại (≤ 3 nét sai) để được cộng điểm Bảng xếp hạng nhé!`;
    setStatus(msgDone);
    hySay(
      `Cố lên · ${esc(v.word)}`,
      `Bạn đã viết xong <strong>“${esc(v.word)}”</strong> (${totalMistakes} nét sai). Bấm <strong>“Tập viết”</strong> luyện lại cho ít nét sai hơn để nhận điểm thưởng và leo <a href="bang-xep-hang" class="hy3d-link">Bảng xếp hạng →</a> nhé!`,
      'wave'
    );
  }
}
document.addEventListener('click',e=>{
  if(activeTab!=='vocab'||!isVocabFlow())return;
  const spk=e.target.closest('.v-focus-wrap .speak');
  if(spk){spk.classList.add('playing');const iv=setInterval(()=>{if(!('speechSynthesis' in window)||!speechSynthesis.speaking){spk.classList.remove('playing');clearInterval(iv)}},250);setTimeout(()=>{spk.classList.remove('playing');clearInterval(iv)},20000);return}
  const gb=e.target.closest('[data-vgroup]');
  if(gb){stopAllOrigAudio(true);vGroup=+gb.dataset.vgroup;vFocus={on:false,g:vGroup,w:0};renderVocab();return}
  const rw=e.target.closest('[data-vword]');
  if(rw){const parts=rw.dataset.vword.split(':');enterFocus(+parts[0],+parts[1]);return}
  const _b=e.target.closest?e.target.closest('button'):null;const _id=_b?_b.id:e.target.id;
  if(_id==='vStart'){enterFocus(vGroup,0);return}
  if(_id==='vBack'||_id==='vList'){exitFocus();return}
  if(_id==='vSrsBtn'){if(typeof SRS!=="undefined"){const vi=vocabGroupsCur()[vFocus.g][vFocus.w];SRS.addManual(SRS.snapshotOf(lessons[activeLesson].vocab[vi]),srsLoc(vi));const b=$('#vSrsBtn');if(b){b.textContent='Đã thêm vào Ôn tập';b.classList.add('added');b.disabled=true}}return}
  if(_id==='vPrev'){moveFocus(-1);return}
  if(_id==='vNext'){moveFocus(1);return}
  if(_id==='vAgain'){enterFocus(vFocus.g,0);return}
  if(_id==='vNextGroup'){enterFocus(vFocus.g+1,0);return}
  if(_id==='vWriteBtn'){setWriteMode('vWriteBtn');animateFocusStrokes();return}
  if(_id==='vQuizBtn'){setWriteMode('vQuizBtn');startFocusQuiz();return}
});
document.addEventListener('keydown',e=>{
  if(activeTab!=='vocab'||!vFocus.on||!isVocabFlow())return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target.closest&&e.target.closest('input,textarea,[contenteditable]'))return;
  if(typeof flashcardOpen==='function'&&flashcardOpen())return;
  if(vQuiz)return;
  if(e.key==='ArrowLeft'){e.preventDefault();moveFocus(-1)}
  else if(e.key==='ArrowRight'){e.preventDefault();moveFocus(1)}
});

function renderVocab(){const l=lessons[activeLesson];if(l)renderVocabPilot(l)}
function grammarExamplesHTML(ex){const parts=(ex||'').split(/; (?=[\u4e00-\u9fff])|[.?!] (?=[\u4e00-\u9fff0-9])|\. (?=A：)/);return parts.map(p=>{let m=p.match(/^(.*?)\s*\((.*?)\)\s*—\s*(.+)$/s);if(m&&(/^[一-鿿0-9]/.test(m[1].trim())||/^[A-Z]：/.test(m[1].trim()))&&m[2].trim()&&m[3].trim())return `<div class="gr-ex"><div class="han">${esc(m[1].trim())}</div><div class="pinyin">${esc(m[2].trim())}</div><div class="vi">${esc(m[3].trim().replace(/\.$/,''))}</div></div>`;m=p.match(/^(.*?)\s*—\s*(.+)$/s);if(m&&(/^[一-鿿0-9]/.test(m[1].trim())||/^[A-Z]：/.test(m[1].trim()))&&m[2].trim())return `<div class="gr-ex"><div class="han">${esc(m[1].trim())}</div><div class="vi">${esc(m[2].trim().replace(/\.$/,''))}</div></div>`;return `<div class="gr-ex"><div class="vi">${esc(p.trim())}</div></div>`}).join('')}
const GR_STORE_KEY='hoc-hsk-gr-practice-v1';
let grActiveTab={};
function grLoadStore(){try{return JSON.parse(localStorage.getItem(GR_STORE_KEY)||'{}')||{}}catch(e){return {}}}
function grSaveStore(obj){try{localStorage.setItem(GR_STORE_KEY,JSON.stringify(obj))}catch(e){}}
function grKey(num,gi,pi){return lbCourseKey()+':'+num+':'+gi+':'+pi}
function grPromptsFor(num,gi){const d=typeof grammarPracticeData!=='undefined'?grammarPracticeData:null;return (d&&d[lbCourseKey()+':'+num+':'+gi])||[]}
function grCheckDetail(typed,it){const t=normalizeChinese(typed);const minL=it.minLength||5;if(t.length<minL)return{ok:false,msg:`Câu hơi ngắn (cần ít nhất ${minL} ký tự chữ Hán) — hãy viết thành một câu hoàn chỉnh nhé.`};let pos=0;const req=it.required||[];for(let k=0;k<req.length;k++){const opts=Array.isArray(req[k])?req[k]:[req[k]];let best=-1,bestEnd=-1;for(let m=0;m<opts.length;m++){const no=normalizeChinese(opts[m]);if(!no)continue;const idx=t.indexOf(no,pos);if(idx>=0&&(best<0||idx<best)){best=idx;bestEnd=idx+no.length}}if(best<0)return{ok:false,msg:`Câu của bạn chưa có thành phần cấu trúc trọng tâm 「${opts[0]}」. Xem lại công thức phía trên rồi thử lại nhé.`};pos=bestEnd}return{ok:true}}
function grLessonStats(l){const store=grLoadStore();let total=0,done=0;l.grammar.forEach((_,gi)=>{const ps=grPromptsFor(l.num,gi);ps.forEach((__,pi)=>{total++;if(store[grKey(l.num,gi,pi)])done++})});return{total,done,pts:done*20,maxPts:total*20}}
function grFormatPromptHTML(raw){const s=String(raw||'').trim();let kicker='',body=s,note='';const colonIdx=s.indexOf(':');if(colonIdx>0&&colonIdx<45){kicker=s.slice(0,colonIdx+1).trim();body=s.slice(colonIdx+1).trim()}if(body.startsWith('"')&&body.endsWith('"')&&body.length>2)body=body.slice(1,-1);const noteM=body.match(/^(.*?)\s*(\([^()]{3,60}\))\.?$/);if(noteM){body=noteM[1].trim();note=noteM[2].trim();if(body&&!/[.?!…]$/.test(body))body+='.'}return `${kicker?`<span class="gr-pr-kicker">${esc(kicker)}</span> `:''}<strong class="gr-pr-target">${esc(body)}</strong>${note?` <span class="gr-pr-note">${esc(note)}</span>`:''}`}
function grPracticeBoxHTML(num,gi){const ps=grPromptsFor(num,gi);if(!ps.length)return '';const store=grLoadStore();const d0=store[grKey(num,gi,0)],d1=store[grKey(num,gi,1)];const doneCount=(d0?1:0)+(d1?1:0);let pi=grActiveTab[num+':'+gi];if(pi===undefined){pi=d0&&!d1?1:0;grActiveTab[num+':'+gi]=pi}const it=ps[pi]||ps[0];const done=store[grKey(num,gi,pi)];const reqLabel=(it.required||[]).map(r=>Array.isArray(r)?r[0]:r).join(' … ');const resHTML=done?`<div class="gr-pr-res ok"><div class="gr-pr-res-head"><strong>✓ Đạt! Bạn đã vận dụng đúng cấu trúc</strong><span class="gr-pts-pop">+20 điểm</span></div><div class="gr-pr-model"><span class="han">${esc(it.model)}</span><button type="button" class="gr-speak-btn" data-read="${esc(it.model)}" aria-label="Nghe câu mẫu">🔊 Nghe mẫu</button></div>${it.modelPinyin?`<div class="pinyin">${esc(it.modelPinyin)}</div>`:''}</div>`:'';return `<div class="gr-practice-box" data-gr-box="${gi}"><div class="gr-pr-head"><span class="gr-pr-title">✍️ Thực hành đặt câu</span><span class="gr-pr-badge${doneCount===ps.length?' done':''}">${doneCount===ps.length?`✓ ${doneCount}/${ps.length} · +${doneCount*20}đ`:`${doneCount}/${ps.length} câu · +20đ/câu`}</span></div><div class="gr-pr-tabs" role="tablist">${ps.map((_,idx)=>{const isDone=!!store[grKey(num,gi,idx)];return `<button type="button" class="gr-pr-tab${idx===pi?' active':''}${isDone?' done':''}" data-gr-tab="${gi}:${idx}" role="tab" aria-selected="${idx===pi}">${isDone?'✓ ':''}Câu ${idx+1}</button>`}).join('')}</div><div class="gr-pr-body"><p class="gr-pr-prompt">${grFormatPromptHTML(it.promptVi)}</p><div class="gr-pr-meta">${reqLabel?`<span class="gr-pr-req">Cần dùng: <strong>${esc(reqLabel)}</strong></span>`:'<span></span>'}${it.hint?`<button type="button" class="gr-hint-btn" data-gr-hint="${gi}:${pi}">💡 Gợi ý</button>`:''}</div>${it.hint?`<div class="gr-hint-box" id="grHint-${gi}-${pi}" hidden>${esc(it.hint)}</div>`:''}<div class="gr-pr-form"><input type="text" class="gr-pr-input" data-gr-input="${gi}:${pi}" lang="zh-CN" autocomplete="off" placeholder="Gõ câu tiếng Trung (không cần dấu câu)…" value="${done?esc(done.typed):''}" ${done?'disabled':''}><button type="button" class="gr-pr-submit" data-gr-submit="${gi}:${pi}" ${done?'disabled':''}>${done?'✓ +20đ':'Kiểm tra (+20đ)'}</button></div><div class="gr-pr-feedback" id="grFb-${gi}-${pi}">${resHTML}</div></div></div>`}
/* Tach o bang 声母和韵母 thanh luoi de chu bat hoi thang hang nhu sach:
   "i [i]" va "iou (iu)" la mot muc, khong tach roi. */
function phonGridTokens(cell){const parts=String(cell||'').split(/\s+/).filter(Boolean);const out=[];for(const p of parts){if((p[0]==='['||p[0]==='(')&&out.length)out[out.length-1]+=' '+p;else out.push(p);}return out;}
function phonTableBodyHTML(s){const isGrid=(s.title||'').indexOf('声母和韵母')>=0;if(!isGrid)return s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('');const colMax=s.table.headers.map((_,ci)=>Math.max.apply(null,s.table.rows.map(r=>phonGridTokens(r[ci]||'').length).concat([1])));return s.table.rows.map(r=>`<tr>${r.map((c,ci)=>{const toks=phonGridTokens(c);if(toks.length<=1)return `<td>${esc(c)}</td>`;return `<td><span class="phon-cell-grid" style="grid-template-columns:repeat(${colMax[ci]},1fr)">${toks.map(t=>`<span>${esc(t)}</span>`).join('')}</span></td>`;}).join('')}</tr>`).join('');}
function phoneticsHTML(l){const ph=l&&l.phonetics;if(!ph||!ph.sections||!ph.sections.length)return '';const audio=ph.audio?origAudioHTML('assets/audio/h1/'+ph.audio,'Nghe phát âm gốc · Bài '+l.num):'';const secs=ph.sections.map((s,i)=>{let h=`<article class="grammar-card"><div class="grammar-title"><span class="g-num">${i+1}.</span> ${esc(s.title)}${s.titleVi?` <span style="font-weight:600;color:var(--muted);font-size:.95rem">(${esc(s.titleVi)})</span>`:''}</div><div class="grammar-body">`;if(s.track)h+=`<span class="phon-track">Audio ${esc(s.track)}</span>`;if(s.text)h+=`<p>${esc(s.text)}</p>`;if(s.textVi)h+=`<p>${esc(s.textVi)}</p>`;if(s.table&&s.table.rows&&s.table.rows.length){h+=`<table class="phon-table"><thead><tr>${s.table.headers.map((hh,hi)=>`<th>${esc(hh)}${s.table.headersVi&&s.table.headersVi[hi]?`<span class="th-vi">${esc(s.table.headersVi[hi])}</span>`:''}</th>`).join('')}</tr></thead><tbody>${phonTableBodyHTML(s)}</tbody></table>`}if(s.words&&s.words.length){h+=`<div class="phon-words">${s.words.map(w=>`<span class="phon-word"><span class="han">${esc(w.han)}</span><span class="pinyin">${esc(w.py)}</span>${w.vi?`<span class="vi">${esc(w.vi)}</span>`:''}</span>`).join('')}</div>`}if(s.exercise){h+=`<div class="phon-exercise"><p><span class="label">Bài tập nghe:</span> ${esc(s.exercise.instruction)}</p>${s.exercise.instructionVi?`<p>${esc(s.exercise.instructionVi)}</p>`:''}`;if(s.exercise.items&&s.exercise.items.length)h+=`<div class="phon-items">${s.exercise.items.map(it=>`<span class="phon-item">${esc(it)}</span>`).join('')}</div>`;h+=`</div>`}return h+'</div></article>'}).join('');return `<div class="section-intro"><h3>Ngữ âm</h3><span class="count">${ph.sections.length} mục</span></div>${audio}<div class="grammar-grid">${secs}</div>`}
function renderGrammar(){const l=lessons[activeLesson];const st=grLessonStats(l);const summaryHTML=st.total?`<div class="gr-lesson-summary" id="grLessonSummary"><div class="gr-sum-top"><span>✍️ Đặt câu theo ngữ pháp · <strong>${st.done}/${st.total}</strong> câu</span><span class="gr-sum-pts">+${st.pts}/${st.maxPts} điểm</span></div><div class="gr-sum-bar"><i style="width:${Math.round(st.done/st.total*100)}%"></i></div></div>`:'';grammarPanel.innerHTML=`${phoneticsHTML(l)}<div class="section-intro"><h3>Ngữ pháp dễ hiểu</h3><span class="count">${l.grammar.length} chủ điểm</span></div>${summaryHTML}<div class="grammar-grid">${l.grammar.map((g,i)=>`<article class="grammar-card"><div class="grammar-title"><span class="g-num">${i+1}.</span> ${esc(g.title)}</div><div class="grammar-body">${g.formula?`<div class="formula">${esc(g.formula)}</div>`:''}<p><span class="label">Hiểu nhanh:</span> ${esc(g.explain)}</p>${g.tip?`<p class="hy-tip-inline"><span class="label">💡 Mẹo của 海英:</span> ${esc(g.tip)}</p>`:''}<div><span class="label">Ví dụ:</span>${grammarExamplesHTML(g.examples)}</div><p class="error"><strong>⚠️ Lỗi thường gặp:</strong> ${esc(g.error)}</p>${grPracticeBoxHTML(l.num,i)}</div></article>`).join('')}</div>`}
function normalizeChinese(text){return String(text).normalize('NFKC').replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()\-—]/g,'').toLowerCase()}
let dictOrder=[];
function dictItemIdx(){return dictOrder.length?dictOrder[dictationIndex]:dictationIndex}
function shuffleDictOrder(){const n=(curDict()[lessons[activeLesson].num]||[]).length;dictOrder=Array.from({length:n},(_,i)=>i);for(let i=dictOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=dictOrder[i];dictOrder[i]=dictOrder[j];dictOrder[j]=t}}
function resetDictation(){dictationIndex=0;dictationScore=0;dictationResults=[];dictationAttempts=[];dictationRevealed=false;shuffleDictOrder();renderDictationQuestion()}
function renderQuiz(){quizPanel.innerHTML='<button class="back-to-zone" data-tab="practice">\u2190 T\u1ea5t c\u1ea3 d\u1ea1ng luy\u1ec7n t\u1eadp</button><div class="dictation-shell" id="dictationShell"></div>';resetDictation()}
function renderDictationQuestion(){const shell=$('#dictationShell');if(!shell)return;const l=lessons[activeLesson],items=curDict()[l.num];if(dictationIndex>=items.length){shell.innerHTML=`<div class="score-card"><span class="level-badge">Hoàn thành ${items.length} câu</span><h3>Kết quả nghe chép</h3><div class="score">${dictationScore}/${items.length}</div><p>${dictationScore>=Math.ceil(items.length*.85)?'Tai nghe rất chắc! Hãy thử nghe lại ở tốc độ thường.':dictationScore>=Math.ceil(items.length*.6)?'Bạn đã nắm khá tốt. Hãy nghe lại các câu sai và chú ý hư từ.':'Hãy làm lại, mỗi câu nghe chậm một lần rồi nghe tốc độ thường.'}</p><button class="action" id="dictationRedo">Làm lại ${items.length} câu</button></div>`;return}const item=items[dictItemIdx()],done=dictationResults[dictationIndex],hzLen=(item[0].match(/[\u3400-\u9FFF]/g)||[]).length,level=hzLen<=15?'Trung bình':hzLen<=20?'Khá':'Khó';dictationRevealed=!!done;shell.innerHTML=`<div class="dictation-intro"><div><h3>Nghe và gõ lại câu tiếng Trung</h3><p class="count">Câu ${dictationIndex+1}/${items.length} · Có thể nghe nhiều lần trước khi kiểm tra.</p></div><span class="level-badge">${level}</span></div><div class="quiz-progress"><i style="width:${dictationIndex/items.length*100}%"></i></div><div class="listen-stage"><button class="listen-button" id="listenSentence" aria-label="Nghe câu ${dictationIndex+1}">▶</button><p class="listen-hint">Bấm để nghe tốc độ thường</p></div><div class="dictation-form"><label for="dictationInput"><strong>Gõ lại câu bạn nghe được</strong></label><input id="dictationInput" class="dictation-input" lang="zh-CN" autocomplete="off" placeholder="在这里输入中文…" value="${done?esc(done.typed):''}" ${done?'disabled':''}><div class="dictation-actions"><button id="listenSlow">Nghe chậm</button><button id="showAnswer">Xem đáp án</button><button class="check" id="checkDictation" ${done?'disabled':''}>Kiểm tra</button></div></div><div id="dictationFeedback">${done?feedbackMarkup(item,done):''}</div><div class="dictation-nav"><button id="dictationPrev" ${dictationIndex===0?'disabled':''}>← Câu trước</button><div class="dictation-dots">${items.map((_,i)=>`<i class="dictation-dot ${dictationResults[i]?'done':''} ${i===dictationIndex?'current':''}"></i>`).join('')}</div><button id="dictationNext">${dictationIndex===items.length-1?'Xem kết quả':'Câu sau →'}</button></div>`}
function curDictPy(){try{return isXia()?(typeof dictPyX!=="undefined"?dictPyX:null):currentLevel===4?(typeof dictPy4!=="undefined"?dictPy4:null):currentLevel===1?(typeof dictPy1!=="undefined"?dictPy1:null):currentLevel===2?(typeof dictPy2!=="undefined"?dictPy2:null):(typeof dictPy3!=="undefined"?dictPy3:null)}catch(err){return null}}
function rubyLine(text,syl){if(!syl||!syl.length)return esc(text);let i=0,out="";for(const ch of text){if(/[\u3400-\u9FFF]/.test(ch)&&i<syl.length){out+="<ruby>"+esc(ch)+"<rt>"+esc(syl[i])+"</rt></ruby>";i++}else out+=esc(ch)}return out}
function feedbackMarkup(item,result){const ok=result.correct;const _ps=curDictPy(),_pl=_ps?_ps[lessons[activeLesson].num]:null,_py=_pl?_pl[dictItemIdx()]:null;return `<div class="dictation-result ${ok?'correct':'wrong'}"><strong>${ok?'Chính xác!':'Chưa khớp hoàn toàn.'}</strong><div class="answer-line">${rubyLine(item[0],_py)}</div><div class="answer-meta">${esc(item[1])}</div><div class="focus-words">Trọng tâm ngữ pháp & từ vựng: ${esc(item[2])}</div>${!ok&&result.typed?`<div class="answer-meta">Bạn đã gõ: ${esc(result.typed)}</div>`:''}</div>`}
function playDictation(rate){const item=curDict()[lessons[activeLesson].num][dictItemIdx()];if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(item[0]);u.lang='zh-CN';u.rate=rate;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/^zh(-|_)?CN/i.test(v.lang))||vs.find(v=>/^zh/i.test(v.lang))||null;speechSynthesis.speak(u)}
function checkDictation(revealOnly){const input=$('#dictationInput'),item=curDict()[lessons[activeLesson].num][dictItemIdx()];if(!input)return;const typed=input.value.trim();if(!typed&&!revealOnly){input.focus();return}const correct=!revealOnly&&normalizeChinese(typed)===normalizeChinese(item[0]);if(!revealOnly&&!correct){dictationAttempts[dictationIndex]=(dictationAttempts[dictationIndex]||0)+1;const n=dictationAttempts[dictationIndex];$('#dictationFeedback').innerHTML=`<div class="dictation-result wrong"><strong>Chưa khớp${n>1?' — lần thử '+n:''}.</strong><div class="answer-meta">Nghe lại, sửa câu rồi bấm Kiểm tra lần nữa nhé.</div></div>`;input.focus();return}if(!dictationResults[dictationIndex]&&correct)dictationScore++;dictationResults[dictationIndex]={typed,correct,revealed:revealOnly};srsPracticeCheck();lbPracticeCheck();input.disabled=true;$('#dictationFeedback').innerHTML=feedbackMarkup(item,dictationResults[dictationIndex]);$('#checkDictation').disabled=true;dictationRevealed=true}
/* ===== ROUTER: URL là nguồn sự thật cho navigation (History API).
   UI state (pinyin, audio, lật thẻ, điểm/mạng trong game...) KHÔNG vào URL. ===== */
function pageCourse(){return currentLevel===1?'hsk1':currentLevel===2?'hsk2':currentLevel===3?'hsk3':currentLevel===4?'hsk4-thuong':'hsk4-ha'}
function flashcardOpen(){return flashOverlay.classList.contains('open')}
function currentView(){
  if(flashcardOpen())return 'luyen-tap/flashcard';
  if(activeTab==='quiz')return 'luyen-tap/nghe-chep';
  if(activeTab==='fill')return 'luyen-tap/dien-tu';
  if(activeTab==='tone')return 'luyen-tap/luyen-thanh-dieu';
  if(activeTab==='workbook')return 'luyen-tap/sach-bai-tap';
  if(activeTab==='guess')return currentGame?'tro-choi/'+Router.GAME_SLUGS[currentGame]:'tro-choi';
  return Router.TAB_SLUGS[activeTab]||'tu-vung';
}
function currentUrl(){let u=Router.url(pageCourse(),lessons[activeLesson].num,currentView());if(activeTab==='vocab'&&vFocus.on&&isVocabFlow())u+='?g='+vFocus.g+'&w='+vFocus.w;return u}
function pushRoute(){const u=currentUrl();if(u!==location.pathname+location.search)history.pushState(null,'',u)}
function applyViewState(view){
  if(view==='luyen-tap/flashcard'){activeTab='practice';currentGame=null;return 'flashcard'}
  if(view==='luyen-tap/nghe-chep'){activeTab='quiz';currentGame=null;return null}
  if(view==='luyen-tap/dien-tu'){activeTab='fill';currentGame=null;return null}
  if(view==='luyen-tap/luyen-thanh-dieu'){activeTab='tone';currentGame=null;return null}
  if(view==='luyen-tap/sach-bai-tap'){activeTab='workbook';currentGame=null;return null}
  if(view==='tro-choi'){activeTab='guess';currentGame=null;return null}
  if(view.indexOf('tro-choi/')===0){activeTab='guess';currentGame=Router.SLUG_GAMES[view.split('/')[1]]||null;return currentGame?'game':null}
  if(view==='tu-vung')activeTab='vocab';
  else if(view==='bai-khoa')activeTab='analysis';
  else if(view==='ngu-phap')activeTab='grammar';
  else if(view==='luyen-tap')activeTab='practice';
  else activeTab='vocab';
  currentGame=null;
  return null;
}
function enterGameView(id){if(id==='cannon')startCannon();else if(id==='karaoke')startKaraoke();else if(id==='fall')renderFallIntro();else if(id==='carp')renderTowerStart()}
function afterRouteRender(action){
  if(action==='game'&&currentGame)enterGameView(currentGame);
  else if(action==='flashcard'){flashDeck=[...lessons[activeLesson].vocab];flashIndex=0;renderFlash();flashOverlay.classList.add('open')}
}
function applyRoute(r,normalize){
  const prevLesson=activeLesson;
  if(r.lessonNum!=null){const li=lessons.findIndex(l=>l.num===r.lessonNum);activeLesson=li>=0?li:0}
  else activeLesson=0;
  if(activeLesson!==prevLesson){stopAllOrigAudio(true);auReset()}
  if(flashcardOpen())flashOverlay.classList.remove('open');
  const action=applyViewState(r.view);
  syncVocabFromUrl(r.view);
  renderAll();
  afterRouteRender(action);
  if(normalize){const u=currentUrl();if(u!==location.pathname+location.search)history.replaceState(null,'',u)}
}
window.addEventListener('popstate',()=>{
  const r=Router.parse(location.pathname,pageCourse());
  if(!r||r.bare){activeLesson=0;activeTab='vocab';currentGame=null;resetVocabState(lessons[0].num);if(flashcardOpen())flashOverlay.classList.remove('open');renderAll();return}
  applyRoute(r,false);
});
function bootLevel(){
  lessons=isXia()?lessons4xia:currentLevel===4?lessons4:currentLevel===1?lessonsHSK1:currentLevel===2?lessonsHSK2:lessonsHSK3;
  const r=Router.parse(location.pathname,pageCourse());
  if(r&&!r.bare){applyRoute(r,true)}
  else{
    activeLesson=0;activeTab='vocab';currentGame=null;
    renderAll();
    if(!r)history.replaceState(null,'','/'+pageCourse());
  }
  window.scrollTo({top:0});
}
function fillData(){const l=lessons[activeLesson];if(!l)return null;if(is4())return (l.fill&&l.fill.items)?l.fill:null;if(currentLevel===1)return (typeof fillData1!=="undefined"?fillData1[l.num]:null)||null;if(currentLevel===2)return (typeof fillData2!=="undefined"?fillData2[l.num]:null)||null;return fillData3[l.num]||null}
function fillItems(){const d=fillData();return d?d.items:[]}
function fillUsedWords(){const used=new Set();fillItems().forEach((it,i)=>{if(it&&it.type==='bank'&&fillResults[i]&&fillResults[i].correct)used.add(it.answer)});return used}
function grammarPass(typed,it){const t=normalizeChinese(typed);if(t.length<(it.minLength||4))return false;let pos=0;const req=it.required||[];for(let k=0;k<req.length;k++){const opts=Array.isArray(req[k])?req[k]:[req[k]];let best=-1,bestEnd=-1;for(let m=0;m<opts.length;m++){const no=normalizeChinese(opts[m]);if(!no)continue;const idx=t.indexOf(no,pos);if(idx>=0&&(best<0||idx<best)){best=idx;bestEnd=idx+no.length}}if(best<0)return false;pos=bestEnd}return true}
function resetFill(){fillIndex=0;fillScore=0;fillResults=[];fillAttempts=[];fillRevealed=false;renderFillQuestion()}
function renderFill(){fillPanel.innerHTML='<button class="back-to-zone" data-tab="practice">\u2190 T\u1ea5t c\u1ea3 d\u1ea1ng luy\u1ec7n t\u1eadp</button><div class="dictation-shell" id="fillShell"></div>';resetFill()}
function fillFeedbackMarkup(it,r){if(it.type==='bank'){if(r.correct)return `<div class="dictation-result correct"><strong>Đúng rồi!</strong><div class="answer-line">${esc(it.fullSentence)}</div><div class="answer-meta">${esc(it.fullPinyin)}</div><div class="answer-meta">${esc(it.hintVi)}</div></div>`;return `<div class="dictation-result wrong"><strong>Đáp án đúng là:</strong><div class="answer-line">${esc(it.fullSentence)}</div><div class="answer-meta">${esc(it.fullPinyin)}</div><div class="focus-words">Từ cần điền: ${esc(it.answer)}</div></div>`}const modelBlock=`<div class="answer-line">Đáp án mẫu: ${esc(it.model)}</div><div class="answer-meta">${esc(it.modelPinyin)}</div>`;if(r.correct)return `<div class="dictation-result correct"><strong>Đạt — bạn đã dùng đúng cấu trúc!</strong><div class="answer-meta">Đáp án không duy nhất; cách viết của bạn hợp lệ về cấu trúc.${r.showModel?'':' Bấm “Xem đáp án mẫu” để đối chiếu thêm một cách diễn đạt.'}</div>${r.showModel?modelBlock:''}</div>`;return `<div class="dictation-result wrong"><strong>Đáp án mẫu để đối chiếu:</strong>${modelBlock}<div class="answer-meta">Câu này được tính là đã xem đáp án — hãy đọc kỹ cấu trúc rồi sang câu tiếp theo.</div></div>`}
function renderFillQuestion(){const shell=$('#fillShell');if(!shell)return;const data=fillData(),items=data?data.items:[],total=items.length;if(!total){shell.innerHTML='<div class="empty">Bài này chưa có câu điền từ.</div>';return}if(fillIndex>=total){shell.innerHTML=`<div class="score-card"><span class="level-badge">Hoàn thành ${total} câu</span><h3>Kết quả điền từ</h3><div class="score">${fillScore}/${total}</div><p>${fillScore>=total-2?'Bạn nắm từ vựng và cấu trúc ngữ pháp trong ngữ cảnh rất chắc! Thử sang game Từ rơi để luyện phản xạ bắt nghĩa thật nhanh.':fillScore>=Math.ceil(total/2)?'Khá tốt. Hãy đọc lại đáp án mẫu ở những câu chưa đạt để nhớ cách dùng cấu trúc.':'Hãy ôn lại từ vựng trọng tâm và các điểm ngữ pháp của bài rồi làm lại nhé.'}</p><button class="action" id="fillRedo">Làm lại</button></div>`;return}const it=items[fillIndex],done=fillResults[fillIndex];const firstGrammar=items.findIndex(x=>x.type==='grammar');let groupIntro='';if(fillIndex===0)groupIntro=`<div class="fill-group-intro"><strong>Nhóm 1 · Chọn từ điền vào chỗ trống （选词填空）</strong><p>Chọn từ trong ngân hàng từ của bài để điền vào chỗ trống — mỗi từ chỉ dùng một lần.</p></div>`;else if(fillIndex===firstGrammar&&firstGrammar>0)groupIntro=`<div class="fill-group-intro"><strong>Nhóm 2 · Hoàn thành câu theo ngữ pháp （完成句子）</strong><p>Hoàn thành câu bằng cách dùng đúng điểm ngữ pháp được ghi trên thẻ — đáp án không duy nhất, viết sao cho đúng cấu trúc và hợp ngữ cảnh.</p></div>`;const used=fillUsedWords();const bankHtml=it.type==='bank'?`<div class="bank-chips" aria-label="Ngân hàng từ của bài">${data.bank.map(bk=>`<button type="button" class="bank-chip${used.has(bk.w)?' used':''}" data-fill-chip="${esc(bk.w)}" ${used.has(bk.w)?'disabled':''}>${esc(bk.w)}<span class="chip-py">${esc(bk.py)}</span></button>`).join('')}</div>`:'';const grammarChip=it.type==='grammar'?`<div class="grammar-chip">Ngữ pháp: ${esc(it.grammarPoint)}</div>`:'';const sentenceHtml=esc(it.sentence).split('\n').join('<br>');shell.innerHTML=`<div class="dictation-intro"><div><h3>${it.type==='bank'?'Điền từ còn thiếu vào câu':'Hoàn thành câu theo ngữ pháp'}</h3><p class="count">Câu ${fillIndex+1}/${total} · ${it.type==='bank'?'Đọc gợi ý tiếng Việt, chọn từ trong ngân hàng từ rồi gõ vào chỗ trống.':'Đọc gợi ý tiếng Việt rồi gõ phần còn thiếu sao cho đúng cấu trúc trên thẻ.'}</p></div><span class="level-badge">Điền từ</span></div><div class="quiz-progress"><i style="width:${fillIndex/total*100}%"></i></div>${groupIntro}<div class="listen-stage">${grammarChip}${bankHtml}<p class="blank-sentence">${sentenceHtml}</p><p class="blank-vi">${esc(it.hintVi)}</p><button class="listen-button" id="fillListen" aria-label="Nghe câu">▶</button><p class="listen-hint">${it.type==='bank'?'Nghe cả câu (sẽ đọc cả đáp án — chỉ nghe khi thật bí)':'Nghe khung câu đã cho'}</p></div><div class="dictation-form"><label for="fillInput"><strong>${it.type==='bank'?'Gõ từ còn thiếu (chữ Hán)':'Gõ phần còn thiếu (chữ Hán)'}</strong></label><input id="fillInput" class="dictation-input" lang="zh-CN" autocomplete="off" placeholder="${it.type==='bank'?'输入缺少的词…':'输入缺少的部分…'}" value="${done?esc(done.typed):''}" ${done?'disabled':''}><div class="dictation-actions"><button id="fillShow">${it.type==='grammar'?'Xem đáp án mẫu':'Xem đáp án'}</button><button class="check" id="fillCheck" ${done?'disabled':''}>Kiểm tra</button></div></div><div id="fillFeedback">${done?fillFeedbackMarkup(it,done):''}</div><div class="dictation-nav"><button id="fillPrev" ${fillIndex===0?'disabled':''}>← Câu trước</button><div class="dictation-dots">${items.map((_,i)=>`<i class="dictation-dot ${fillResults[i]?'done':''} ${i===fillIndex?'current':''}"></i>`).join('')}</div><button id="fillNext">${fillIndex===total-1?'Xem kết quả':'Câu sau →'}</button></div>`}
function checkFill(revealOnly){const input=$('#fillInput'),items=fillItems(),it=items[fillIndex];if(!input||!it)return;const existing=fillResults[fillIndex];if(revealOnly&&existing){if(existing.correct&&!existing.showModel){existing.showModel=true;$('#fillFeedback').innerHTML=fillFeedbackMarkup(it,existing)}return}const typed=input.value.trim();if(!typed&&!revealOnly){input.focus();return}let correct=false;if(!revealOnly){correct=it.type==='bank'?[it.answer].concat(it.acceptAlso||[]).some(ans=>normalizeChinese(typed)===normalizeChinese(ans)):grammarPass(typed,it)}if(!revealOnly&&!correct){fillAttempts[fillIndex]=(fillAttempts[fillIndex]||0)+1;const n=fillAttempts[fillIndex];if(n===1&&it.type==='bank')srsFillRecord(it);$('#fillFeedback').innerHTML=it.type==='bank'?`<div class="dictation-result wrong"><strong>Chưa đúng${n>1?' — lần thử '+n:''}.</strong><div class="answer-meta">Từ này chưa khớp với chỗ trống. Đọc lại gợi ý và ngân hàng từ rồi thử lại nhé.</div></div>`:`<div class="dictation-result wrong"><strong>Chưa đạt${n>1?' — lần thử '+n:''}.</strong><div class="answer-meta">Câu của bạn chưa khớp yêu cầu cấu trúc. Xem lại thẻ ngữ pháp phía trên rồi thử lại nhé.</div></div>`;input.focus();return}if(!existing&&correct)fillScore++;if(!existing&&revealOnly&&it.type==='bank')srsFillRecord(it);fillResults[fillIndex]={typed,correct,revealed:revealOnly};srsPracticeCheck();lbPracticeCheck();input.disabled=true;$('#fillFeedback').innerHTML=fillFeedbackMarkup(it,fillResults[fillIndex]);const c=$('#fillCheck');if(c)c.disabled=true}
function playFill(){const items=fillItems(),it=items[fillIndex];if(!it)return;speak(it.type==='bank'?it.fullSentence:it.sentence.split('＿＿').join(''))}


function stopGame(){if(gameRaf)cancelAnimationFrame(gameRaf);gameRaf=0;if(gameTimer)clearTimeout(gameTimer);gameTimer=0;game=null}
function vocabPhoto(i){const l=lessons[activeLesson],pfx=l.photoPrefix||('l'+l.num),sub=pfx.startsWith('h1-')?'hsk1':(pfx.startsWith('h2-')?'hsk2':(pfx.startsWith('h4x-')?'hsk4-2':(pfx.startsWith('h4-')?'hsk4-1':'hsk3')));return `assets/vocab-photos/${sub}/${pfx}-${String(i).padStart(2,'0')}.jpg`}
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function comboMult(s){return s>=10?5:s>=6?3:s>=3?2:1}
function renderGuess(){stopGame();stopTower();stopCannon();stopKaraoke();const tb=document.querySelector('[data-tab="guess"]');if(tb)tb.textContent='Trò chơi';guessPanel.innerHTML=gameCardsHTML();}
let sfxCtx=null,sfxMuted=false;
function sfx(kind){if(sfxMuted)return;try{if(!sfxCtx)sfxCtx=new (window.AudioContext||window.webkitAudioContext)();if(sfxCtx.state==='suspended')sfxCtx.resume();const t=sfxCtx.currentTime;const tone=(f0,f1,dur,type,vol,delay)=>{const o=sfxCtx.createOscillator(),g=sfxCtx.createGain();o.type=type;o.connect(g);g.connect(sfxCtx.destination);const s=t+(delay||0);o.frequency.setValueAtTime(f0,s);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),s+dur);g.gain.setValueAtTime(vol,s);g.gain.exponentialRampToValueAtTime(0.001,s+dur);o.start(s);o.stop(s+dur+0.02)};if(kind==='tick')tone(880,880,0.07,'square',0.05);else if(kind==='go')tone(660,990,0.14,'sine',0.09);else if(kind==='shoot')tone(900,280,0.12,'triangle',0.07);else if(kind==='pop')tone(320,70,0.18,'sine',0.12);else if(kind==='ding')tone(1320,1320,0.16,'sine',0.09);else if(kind==='buzz')tone(150,110,0.2,'sawtooth',0.05);else if(kind==='win'){tone(523,523,0.14,'sine',0.09,0);tone(659,659,0.14,'sine',0.09,0.1);tone(784,784,0.22,'sine',0.09,0.2)}else if(kind==='lose'){tone(392,392,0.16,'sine',0.08,0);tone(262,262,0.26,'sine',0.08,0.16)}}catch(e){}}
function sfxBtnLabel(){return sfxMuted?'Bật tiếng':'Tắt tiếng'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sfx-toggle]');if(!b)return;sfxMuted=!sfxMuted;document.querySelectorAll('[data-sfx-toggle]').forEach(x=>{const on=x.querySelector('.sfx-on'),off=x.querySelector('.sfx-off');if(on&&off){on.hidden=sfxMuted;off.hidden=!sfxMuted;x.classList.toggle('muted',sfxMuted)}else x.textContent=sfxBtnLabel();x.setAttribute('aria-label',sfxMuted?'Bật tiếng':'Tắt tiếng')});if(!sfxMuted)sfx('ding')});
const ICON_PAUSE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><rect x="9" y="8.5" width="2" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="8.5" width="2" height="7" rx="1" fill="currentColor" stroke="none"/></svg>';
const ICON_RESTART='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3v4h-4"/></svg>';
const ICON_SPK_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none"/><path d="M15 9a4.5 4.5 0 0 1 0 6"/><path d="M17.5 6.5a8.5 8.5 0 0 1 0 11"/></svg>';
const ICON_SPK_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6.5 9H3v6h3.5L11 19V5z" fill="currentColor" stroke="none"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
const ICON_GRID='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></svg>';
function spkBtnHTML(){return `<button class="cn-btn cn-btn-icon" data-sfx-toggle aria-label="${sfxMuted?'Bật tiếng':'Tắt tiếng'}"><span class="sfx-on" ${sfxMuted?'hidden':''}>${ICON_SPK_ON}</span><span class="sfx-off" ${sfxMuted?'':'hidden'}>${ICON_SPK_OFF}</span></button>`;}
function fallSceneryHTML(){
  return `<div class="fall-scenery" aria-hidden="true"><svg class="fall-bg-svg" viewBox="0 0 800 360" preserveAspectRatio="none"><defs><linearGradient id="fallSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E5F0EC"/><stop offset="60%" stop-color="#F3EFE4"/><stop offset="100%" stop-color="#EDE4CE"/></linearGradient></defs><rect width="800" height="360" fill="url(#fallSky)"/><circle cx="680" cy="64" r="36" fill="#F7DC94" opacity=".65"/><path d="M0 290 Q120 220 250 275 T520 250 T800 280 L800 360 L0 360 Z" fill="#C9DDD5" opacity=".5"/><path d="M0 315 Q180 265 360 305 T700 285 T800 310 L800 360 L0 360 Z" fill="#A9C8BE" opacity=".55"/><g class="cloud-drift-1" fill="#FFFDF7" opacity=".82"><path d="M90 65 Q105 50 122 60 Q140 48 156 64 Q170 66 168 78 L80 78 Q76 66 90 65 Z"/></g><g class="cloud-drift-2" fill="#FFFDF7" opacity=".75"><path d="M520 95 Q538 78 558 90 Q578 76 595 94 Q612 96 608 110 L508 110 Q504 96 520 95 Z"/></g></svg></div>`;
}
function startGame(){const l=lessons[activeLesson];stopGame();stopCannon();stopTone();game={score:0,lives:3,streak:0,bestStreak:0,correct:0,missed:[],deck:shuffleArr(l.vocab.map((_,i)=>i)),di:0,over:false,paused:false,round:null};guessPanel.innerHTML=`<div class="dictation-shell"><div class="cn-bar"><div class="cn-top"><div class="cn-stats"><div class="cn-stat"><span class="cn-stat-label">Điểm</span><strong class="cn-stat-value" id="gameScore">0</strong></div><div class="cn-stat"><span class="cn-stat-label">Combo</span><strong class="cn-stat-value" id="gameCombo">×1</strong></div><div class="cn-stat"><span class="cn-stat-label">Chuỗi</span><strong class="cn-stat-value" id="gameStreak">0</strong></div><div class="cn-stat"><span class="cn-stat-label">Từ</span><strong class="cn-stat-value" id="gameProgress">0/${game.deck.length}</strong></div><div class="cn-stat"><span class="cn-stat-label">Mạng</span><span class="cn-stat-value" id="gameLives" aria-label="Số mạng còn lại">${heartsHTML(3)}</span></div></div><div class="cn-actions"><button class="cn-btn cn-btn-pause" id="gamePause">${ICON_PAUSE}<span>Tạm dừng</span></button><button class="cn-btn cn-btn-icon" id="gameRestart" aria-label="Chơi lại">${ICON_RESTART}</button>${spkBtnHTML()}<button class="cn-btn cn-btn-icon" data-gallery-back aria-label="Chọn game">${ICON_GRID}</button></div></div><div class="cn-track"><div class="cn-fill" id="gameFill" style="width:0%"></div></div></div><div class="game-field" id="gameField">${fallSceneryHTML()}<div class="fall-card" id="fallCard"></div><div class="game-ground"></div><div class="game-veil" id="gameVeil" hidden><p>Đã tạm dừng</p><button class="action" id="gameResume">Chơi tiếp</button><button class="game-quit" id="gameQuit">Dừng hẳn</button></div></div><div class="game-answers" id="gameAnswers"></div></div>`;nextFall()}
function fallDuration(){return Math.max(2200,Math.round(6000*Math.pow(.92,Math.floor(game.correct/5))))}
function pickNextIdx(){if(game.di>=game.deck.length)return null;return{idx:game.deck[game.di++]}}
function nextFall(){if(!game||game.over)return;const l=lessons[activeLesson],pick=pickNextIdx();if(!pick){gameOver(true);return}const v=l.vocab[pick.idx],gold=!!v.star;const others=shuffleArr(l.vocab.map((_,i)=>i).filter(i=>i!==pick.idx&&l.vocab[i].meaning!==v.meaning));const opts=shuffleArr([pick.idx,...others.slice(0,3)]);game.round={idx:pick.idx,gold:gold,wronged:false,done:false,elapsed:0,dur:fallDuration(),last:0};const card=$('#fallCard');if(!card)return;card.className='fall-card'+(gold?' gold':'');card.style.transform='translate(-50%,0px)';card.innerHTML=`<div class="fall-knot" aria-hidden="true"></div><div class="fall-inner">${gold?'<div class="gold-tag">★ NGỌC BỘI VÀNG ×3</div>':''}<img class="fall-photo" src="${vocabPhoto(pick.idx)}" alt="" loading="lazy" decoding="async"><div class="fall-word">${esc(v.word)}</div></div>`;$('#gameAnswers').innerHTML=opts.map((oi,k)=>`<button class="game-answer" data-game-answer="${oi}"><span class="ans-num">${k+1}</span><span>${esc(l.vocab[oi].meaning)}</span></button>`).join('');updateHud();gameTick()}
function gameTick(){if(gameRaf)cancelAnimationFrame(gameRaf);if(!game||!game.round)return;game.round.last=performance.now();const step=now=>{if(!game||game.over||!game.round||game.round.done)return;const hv=$('#homeView');if(hv&&!hv.hidden){stopGame();return}const dt=now-game.round.last;game.round.last=now;if(!game.paused){game.round.elapsed+=dt;const field=$('#gameField'),card=$('#fallCard');if(!field||!card){gameRaf=0;return}const maxY=Math.max(0,field.clientHeight-card.offsetHeight-16);const p=Math.min(1,game.round.elapsed/game.round.dur);card.style.transform=`translate(-50%,${(p*maxY).toFixed(1)}px)`;if(p>=1){roundGround();return}}gameRaf=requestAnimationFrame(step)};gameRaf=requestAnimationFrame(step)}
function finishRound(delay){if(gameRaf)cancelAnimationFrame(gameRaf);gameRaf=0;const g=game;if(gameTimer)clearTimeout(gameTimer);gameTimer=setTimeout(()=>{if(!game||game!==g||g.over)return;if(g.lives<=0)gameOver();else nextFall()},delay)}
function addMissed(i){if(game&&!game.missed.includes(i))game.missed.push(i)}
function updateHud(){if(!game)return;const s=$('#gameScore'),c=$('#gameCombo'),st=$('#gameStreak'),lv=$('#gameLives');if(s)s.textContent=game.score;if(c)c.textContent='×'+comboMult(game.streak);if(st)st.textContent=game.streak;if(lv)lv.innerHTML=heartsHTML(game.lives);const pg=$('#gameProgress');if(pg&&game.deck)pg.textContent=Math.min(game.di,game.deck.length)+'/'+game.deck.length;const fl=$('#gameFill');if(fl&&game.deck)fl.style.width=(Math.min(game.di,game.deck.length)/game.deck.length*100)+'%'}
function floatScore(txt,gold){const f=$('#gameField'),card=$('#fallCard');if(!f||!card)return;const fr=f.getBoundingClientRect(),cr=card.getBoundingClientRect();const el=document.createElement('div');el.className='game-float'+(gold?' gold':'');el.textContent=txt;el.style.left=(cr.left-fr.left+cr.width/2)+'px';el.style.top=Math.max(0,cr.top-fr.top-6)+'px';f.appendChild(el);setTimeout(()=>el.remove(),950)}
function shakeCard(){const inner=document.querySelector('#fallCard .fall-inner');if(!inner)return;inner.classList.remove('shake');void inner.offsetWidth;inner.classList.add('shake')}
function gameAnswer(idx){if(!game||game.over||game.paused||!game.round||game.round.done)return;markStreak();const r=game.round,btn=document.querySelector(`[data-game-answer="${idx}"]`);if(idx===r.idx){r.done=true;(game.correctSet=game.correctSet||new Set()).add(r.idx);sfx('ding');if(btn)btn.classList.add('right');document.querySelectorAll('[data-game-answer]').forEach(b=>b.disabled=true);if(!r.wronged){game.streak++;game.bestStreak=Math.max(game.bestStreak,game.streak);game.correct++;const pts=10*comboMult(game.streak)*(r.gold?3:1);game.score+=pts;floatScore('+'+pts,r.gold);const inner=document.querySelector('#fallCard .fall-inner');if(inner)inner.classList.add('pop')}updateHud();finishRound(480)}else{if(btn){btn.classList.add('wrong');btn.disabled=true}shakeCard();if(!r.wronged){r.wronged=true;sfx('buzz');game.lives--;game.streak=0;addMissed(r.idx);srsRecord(r.idx,'meaning','wrong',r);updateHud();if(game.lives<=0){r.done=true;finishRound(500)}}}}
function roundGround(){if(!game||!game.round||game.round.done)return;const r=game.round;r.done=true;if(!r.wronged){game.lives--;addMissed(r.idx);srsRecord(r.idx,'meaning','missed',r)}game.streak=0;updateHud();const card=$('#fallCard');if(card)card.classList.add('thud');sfx('pop');document.querySelectorAll('[data-game-answer]').forEach(b=>b.disabled=true);finishRound(520)}
function gameOver(win){if(!game)return;if(typeof Streak!=="undefined"&&game.correctSet)Streak.noteGame(game.correctSet.size);if(window.LB&&game.correctSet)LB.award('game','game-fall',game.correctSet.size,game.correctSet.size+(game.missed?game.missed.length:0));sfx(win?'win':'lose');game.over=true;if(gameRaf)cancelAnimationFrame(gameRaf);gameRaf=0;const l=lessons[activeLesson];const missedHtml=game.missed.length?`<div class="game-missed"><h4>Từ bạn đã bắt trượt — ôn lại ngay nhé</h4><div class="game-missed-list">${game.missed.map(i=>{const v=l.vocab[i];return `<div class="game-missed-item"><img src="${vocabPhoto(i)}" alt=""><div><div class="han">${esc(v.word)}${v.star?' <span class="vocab-beyond">Vượt cấp</span>':''}</div><div class="pinyin">${esc(v.pinyin)}</div><div>${esc(v.meaning)}</div></div></div>`}).join('')}</div></div>`:'<p class="game-perfect">Ván này bạn không bắt trượt từ nào — bắt gọn cả bài!</p>';guessPanel.innerHTML=`<div class="dictation-shell"><div class="score-card"><span class="level-badge">${win?'Thắng rồi — bắt hết cả bài!':'Kết thúc ván'}</span><h3>Từ Rơi Bắt Nghĩa · Bài ${l.num}</h3><div class="score">${game.score} điểm</div><p>Chuỗi đúng dài nhất: <strong>${game.bestStreak} từ</strong> · Bắt đúng: <strong>${game.correct} từ</strong></p>${missedHtml}${srsCtaHTML()}<button class="action game-play" id="gamePlay">Chơi lại</button><button class="game-other" data-gallery-back>Chọn game khác</button></div></div>`}
document.addEventListener('click',e=>{const _b=e.target.closest?e.target.closest('button'):null;const _id=_b?_b.id:e.target.id;if(_id==='gamePlay'){startGame();return}if(_id==='gamePause'&&game&&!game.over){game.paused=true;const veil=$('#gameVeil');if(veil)veil.hidden=false;return}if(_id==='gameResume'&&game){game.paused=false;const veil=$('#gameVeil');if(veil)veil.hidden=true;return}if(_id==='gameRestart'){startGame();return}if(_id==='gameQuit'){currentGame=null;renderGuess();pushRoute();return}const ab=e.target.closest('[data-game-answer]');if(ab&&!ab.disabled)gameAnswer(+ab.dataset.gameAnswer)});
document.addEventListener('keydown',e=>{if(!game||game.over||game.paused||activeTab!=='guess')return;if(e.target.closest&&e.target.closest('input,textarea'))return;const map={'1':0,'2':1,'3':2,'4':3};if(e.key in map){const btns=document.querySelectorAll('[data-game-answer]');const b=btns[map[e.key]];if(b&&!b.disabled)gameAnswer(+b.dataset.gameAnswer)}});
function towerLesson(){return activeLesson%2===1}



function stopTower(){if(towerRaf)cancelAnimationFrame(towerRaf);towerRaf=0;if(towerTimer)clearTimeout(towerTimer);towerTimer=0;tower=null}
function cpLongMenSVG(){return `<svg viewBox="0 0 180 42" role="img" aria-label="Cổng Long Môn"><path d="M12 16 Q90 2 168 16 L160 22 Q90 9 20 22 Z" fill="#D4A238" stroke="#193B39" stroke-width="1.3"/><path d="M28 22 H152 V27 H28 Z" fill="#193B39"/><rect x="36" y="26" width="7" height="15" rx="2" fill="#2E7D6B" stroke="#193B39" stroke-width="1"/><rect x="137" y="26" width="7" height="15" rx="2" fill="#2E7D6B" stroke="#193B39" stroke-width="1"/><rect x="64" y="10" width="52" height="21" rx="6" fill="#FFFFFF" stroke="#D4A238" stroke-width="2"/><text x="90" y="24.5" text-anchor="middle" font-size="12" font-weight="900" fill="#193B39" font-family="serif">龙门</text></svg>`}
function cpCarpSVG(stage){
  const tier=stage>=8?' is-high':stage>=4?' is-mid':'';
  return `<span class="cp-carp-ripple" aria-hidden="true"></span><img class="cp-carp-img${tier}" src="assets/cp-carp.png" alt="Cá chép vàng" decoding="async">`;
}
function cpDragonSVG(){
  return `<img class="cp-dragon-img" src="assets/cp-dragon.png" alt="Thần Long Hóa Rồng" decoding="async">`;
}
function renderTowerStart(){guessPanel.innerHTML=`<div class="dictation-shell"><div class="game-start"><span class="level-badge">Game vượt thác 4 làn</span><h3 class="game-title">Cá Chép Vượt Vũ Môn</h3><div class="game-rules"><p><strong>Cách chơi:</strong> Bốn viên ngọc đáp án trôi theo dòng thác qua 4 làn nước. Lái chú Cá Chép chạm vào đúng viên ngọc khớp với từ mục tiêu để vượt <strong>10 ghềnh thác</strong> tới Long Môn hóa rồng!</p><p><strong>Điều khiển cực mượt:</strong> Chạm trực tiếp vào viên ngọc trên thác (hoặc bấm phím <code>1–4</code>) để cá phóng tới ăn ngay; hoặc dùng phím mũi tên <code>←</code> <code>→</code> lái cá vào đúng làn.</p><p><strong>Tiến hóa &amp; Combo:</strong> Trả lời đúng liên tiếp để tăng Combo (×2, ×3) và nâng cấp vây vàng — vảy rồng cho cá chép. Hóa rồng ở ghềnh 10 thưởng lớn <strong>+50 điểm</strong>!</p></div><button class="action game-play" id="towerPlay">Xuất phát vượt thác</button><button class="game-other" data-gallery-back>Chọn game khác</button></div></div>`}
function towerField(type){return type==='vi2han'?'word':type==='han2vi'?'meaning':'pinyin'}
function startTower(){
  const l=lessons[activeLesson];stopGame();stopCannon();stopTone();stopTower();
  tower={score:0,stage:0,maxStage:10,bestStage:0,lives:3,streak:0,bestStreak:0,falls:0,correctCount:0,won:false,over:false,paused:false,lane:1,deck:shuffleArr(l.vocab.map((_,i)=>i)),di:0,lastIdx:-1,qCount:0,missed:[],correctSet:new Set(),round:null};
  guessPanel.innerHTML=`<div class="dictation-shell"><div class="cn-bar"><div class="cn-top"><div class="cn-stats"><div class="cn-stat"><span class="cn-stat-label">Điểm</span><strong class="cn-stat-value" id="cpScore">0</strong></div><div class="cn-stat"><span class="cn-stat-label">Combo</span><strong class="cn-stat-value" id="cpCombo">×1</strong></div><div class="cn-stat"><span class="cn-stat-label">Ghềnh</span><strong class="cn-stat-value" id="cpStage">0/10</strong></div><div class="cn-stat"><span class="cn-stat-label">Mạng</span><span class="cn-stat-value" id="cpLives" aria-label="Số mạng còn lại">${heartsHTML(3)}</span></div></div><div class="cn-actions"><button class="cn-btn cn-btn-pause" id="cpPause">${ICON_PAUSE}<span>Tạm dừng</span></button><button class="cn-btn cn-btn-icon" id="cpRestart" aria-label="Chơi lại">${ICON_RESTART}</button>${spkBtnHTML()}<button class="cn-btn cn-btn-icon" data-gallery-back aria-label="Chọn game">${ICON_GRID}</button></div></div><div class="cn-track"><div class="cn-fill" id="cpFill" style="width:0%"></div></div></div><div class="cp-stage" id="cpStageBox"><div class="cp-water-streams" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="cp-top-gate" id="cpGateWrap">${cpLongMenSVG()}<div class="cp-prompt-banner" id="cpPromptBanner"></div></div><div class="cp-lanes" id="cpLanes"></div><div class="cp-carp-hero" id="cpCarpHero">${cpCarpSVG(0)}</div><div class="cp-dragon-win" id="cpDragonWin" hidden>${cpDragonSVG()}<div class="cp-dragon-txt">HÓA RỒNG! +50đ</div></div><div class="game-veil" id="cpVeil" hidden><p>Đã tạm dừng</p><button class="action" id="cpResume">Chơi tiếp</button><button class="game-quit" data-gallery-back>Dừng hẳn</button></div></div><p class="game-note">Chạm vào viên ngọc đáp án (hoặc bấm 1–4 / ← → + Space) để cá phóng lên ăn ngọc.</p></div>`;
  updateCpCarpPos();
  nextTowerQ();
}
function updateTowerHud(){
  if(!tower)return;
  const s=$('#cpScore'),cb=$('#cpCombo'),st=$('#cpStage'),lv=$('#cpLives'),fl=$('#cpFill'),gw=$('#cpGateWrap');
  const mult=tower.streak>=6?3:tower.streak>=3?2:1;
  if(s)s.textContent=tower.score;
  if(cb)cb.textContent='×'+mult;
  if(st)st.textContent=tower.stage+'/'+tower.maxStage;
  if(lv)lv.innerHTML=heartsHTML(tower.lives);
  if(fl)fl.style.width=(tower.stage/tower.maxStage*100)+'%';
  if(gw)gw.style.setProperty('--cp-glow',(0.2+tower.stage/tower.maxStage*0.8).toFixed(2));
}
function updateCpCarpPos(){
  if(!tower)return;
  const hero=$('#cpCarpHero');if(!hero)return;
  hero.style.left=(tower.lane*25+12.5)+'%';
  const lanes=document.querySelectorAll('.cp-lane-col');
  lanes.forEach((el,i)=>el.classList.toggle('is-active',i===tower.lane));
}
function nextTowerQ(){
  if(!tower||tower.over)return;
  const hv=$('#homeView');if(hv&&!hv.hidden){stopTower();return}
  const l=lessons[activeLesson];
  if(tower.di>=tower.deck.length){
    tower.deck=shuffleArr(l.vocab.map((_,i)=>i));tower.di=0;
    if(tower.deck.length>1&&tower.deck[0]===tower.lastIdx)tower.deck.push(tower.deck.shift());
  }
  const idx=tower.deck[tower.di++];tower.lastIdx=idx;
  const types=['vi2han','han2vi','han2py'];const type=types[tower.qCount%3];tower.qCount++;
  const f=towerField(type);
  const others=shuffleArr(l.vocab.map((_,i)=>i).filter(i=>i!==idx&&l.vocab[i][f]!==l.vocab[idx][f]));
  const opts=shuffleArr([idx,...others.slice(0,3)]);
  const dur=Math.max(6800,11200-tower.stage*420);
  tower.round={idx,type,opts,elapsed:0,dur,last:0,done:false};

  const v=l.vocab[idx];
  const typeLabel=type==='vi2han'?'Chọn chữ Hán':type==='han2vi'?'Chọn nghĩa Việt':'Chọn Pinyin';
  const promptText=type==='vi2han'?esc(v.meaning):esc(v.word);
  const banner=$('#cpPromptBanner');
  if(banner){
    banner.innerHTML=`<span class="cp-qtype">${typeLabel}</span><strong class="cp-qword${type==='vi2han'?'':' han'}">${promptText}</strong><button type="button" class="cp-spk-btn" id="cpSpeak" aria-label="Nghe phát âm">🔊</button>`;
  }
  const lanesEl=$('#cpLanes');
  if(lanesEl){
    lanesEl.innerHTML=[0,1,2,3].map(k=>{
      const oi=opts[k];
      const txt=oi==null?'':(type==='vi2han'?`<span class="cp-han-ans">${esc(l.vocab[oi].word)}</span>`:type==='han2vi'?esc(l.vocab[oi].meaning):esc(l.vocab[oi].pinyin));
      return `<div class="cp-lane-col${k===tower.lane?' is-active':''}" data-cp-lane-hit="${k}"><div class="cp-stone" data-cp-stone="${k}"><span class="cp-key-num">${k+1}</span><div class="cp-stone-txt">${txt}</div></div></div>`;
    }).join('');
  }
  const hero=$('#cpCarpHero');
  if(hero){hero.classList.remove('is-lunging','is-hurt');hero.innerHTML=cpCarpSVG(tower.stage)}
  updateCpCarpPos();
  updateTowerHud();
  if(!sfxMuted&&type!=='vi2han')speak(v.word);
  towerTick();
}
function towerTick(){
  if(towerRaf)cancelAnimationFrame(towerRaf);
  if(!tower||!tower.round||tower.round.done)return;
  tower.round.last=performance.now();
  const step=now=>{
    if(!tower||tower.over||!tower.round||tower.round.done)return;
    const hv=$('#homeView');if(hv&&!hv.hidden){stopTower();return}
    const dt=Math.min(60,now-tower.round.last);tower.round.last=now;
    if(!tower.paused){
      tower.round.elapsed+=dt;
      const lanesEl=$('#cpLanes');if(!lanesEl){towerRaf=0;return}
      const stones=lanesEl.querySelectorAll('.cp-stone');
      const firstH=stones[0]?stones[0].offsetHeight:64;
      const maxY=Math.max(40,lanesEl.clientHeight-firstH-82);
      const p=Math.min(1,tower.round.elapsed/tower.round.dur);
      const y=p*maxY;
      for(let i=0;i<stones.length;i++)stones[i].style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
      if(p>=1){towerAnswerLane(tower.lane,true);return}
    }
    towerRaf=requestAnimationFrame(step);
  };
  towerRaf=requestAnimationFrame(step);
}
function spawnCpBubbles(laneIdx,txt,good){
  const stageBox=$('#cpStageBox');if(!stageBox)return;
  const stones=document.querySelectorAll('.cp-stone');
  const st=stones[laneIdx];
  const sr=stageBox.getBoundingClientRect();
  const r=st?st.getBoundingClientRect():null;
  const cx=r?(r.left-sr.left+r.width/2):((laneIdx*0.25+0.125)*sr.width);
  const cy=r?(r.top-sr.top+r.height/2):(sr.height*0.6);
  const fl=document.createElement('div');
  fl.className='cp-float'+(good?' good':' bad');fl.textContent=txt;
  fl.style.left=cx+'px';fl.style.top=Math.max(84,cy-12)+'px';
  stageBox.appendChild(fl);setTimeout(()=>fl.remove(),900);
  if(good){
    for(let i=0;i<10;i++){
      const b=document.createElement('span');b.className='cp-bubble';
      const ang=Math.random()*Math.PI*2,dist=18+Math.random()*36;
      b.style.left=cx+'px';b.style.top=cy+'px';
      b.style.setProperty('--bx',(Math.cos(ang)*dist).toFixed(1)+'px');
      b.style.setProperty('--by',(Math.sin(ang)*dist-16).toFixed(1)+'px');
      stageBox.appendChild(b);setTimeout(()=>b.remove(),650);
    }
  }
}
function towerAnswerLane(laneIdx,fromDrift){
  if(!tower||tower.over||tower.paused||!tower.round||tower.round.done)return;
  markStreak();
  const t=tower,r=t.round;r.done=true;
  if(towerRaf){cancelAnimationFrame(towerRaf);towerRaf=0}
  t.lane=laneIdx;updateCpCarpPos();
  const hero=$('#cpCarpHero'),stageBox=$('#cpStageBox');
  const stones=document.querySelectorAll('.cp-stone');
  const chosen=r.opts[laneIdx];
  const ok=chosen===r.idx;
  const chosenStone=stones[laneIdx];

  if(ok){
    if(hero){hero.classList.remove('is-lunging');void hero.offsetWidth;hero.classList.add('is-lunging')}
    if(chosenStone)chosenStone.classList.add('is-correct');
    (t.correctSet=t.correctSet||new Set()).add(r.idx);
    t.streak++;t.bestStreak=Math.max(t.bestStreak,t.streak);
    const mult=t.streak>=6?3:t.streak>=3?2:1;
    const pts=10*mult;
    t.score+=pts;t.stage++;t.correctCount++;t.bestStage=Math.max(t.bestStage,t.stage);
    sfx('ding');
    spawnCpBubbles(laneIdx,'+'+pts+(mult>1?' ×'+mult:''),true);
    updateTowerHud();
    if(t.stage>=t.maxStage){
      t.won=true;t.score+=50;updateTowerHud();
      const dw=$('#cpDragonWin');if(dw)dw.hidden=false;
      if(hero)hero.style.opacity='0';
      sfx('win');
      towerTimer=setTimeout(()=>{if(tower===t&&!t.over)towerEnd(true)},1750);
    }else{
      towerTimer=setTimeout(()=>{if(tower===t&&!t.over)nextTowerQ()},540);
    }
  }else{
    if(chosenStone)chosenStone.classList.add('is-wrong');
    const rightLane=r.opts.indexOf(r.idx);
    if(rightLane>=0&&stones[rightLane])stones[rightLane].classList.add('is-reveal');
    if(hero){hero.classList.remove('is-hurt');void hero.offsetWidth;hero.classList.add('is-hurt')}
    if(stageBox){stageBox.classList.remove('shake');void stageBox.offsetWidth;stageBox.classList.add('shake')}
    sfx('buzz');
    t.lives--;t.falls++;t.streak=0;
    if(!t.missed.includes(r.idx))t.missed.push(r.idx);
    srsRecord(r.idx,r.type==='vi2han'?'hanzi':r.type==='han2py'?'pinyin':'meaning','wrong',r);
    spawnCpBubbles(laneIdx,fromDrift?'Trôi qua!':'Sai rồi!',false);
    updateTowerHud();
    towerTimer=setTimeout(()=>{
      if(tower!==t||t.over)return;
      if(t.lives<=0)towerEnd(false);else nextTowerQ();
    },950);
  }
}
function towerEnd(win){
  if(!tower)return;
  if(typeof Streak!=="undefined"&&tower.correctSet)Streak.noteGame(tower.correctSet.size);
  if(window.LB&&tower.correctSet)LB.award('game','game-tower',tower.correctSet.size,tower.correctSet.size+(tower.missed?tower.missed.length:0));
  if(!win)sfx('lose');
  tower.over=true;
  if(towerRaf){cancelAnimationFrame(towerRaf);towerRaf=0}
  if(towerTimer){clearTimeout(towerTimer);towerTimer=0}
  const t=tower,l=lessons[activeLesson];
  const missedHtml=t.missed.length?`<div class="game-missed"><h4>Từ cần ôn lại sau chuyến vượt thác</h4><div class="game-missed-list">${t.missed.map(i=>{const v=l.vocab[i];return `<div class="game-missed-item"><img src="${vocabPhoto(i)}" alt=""><div><div class="han">${esc(v.word)}${v.star?' <span class="vocab-beyond">Vượt cấp</span>':''}</div><div class="pinyin">${esc(v.pinyin)}</div><div>${esc(v.meaning)}</div></div></div>`}).join('')}</div></div>`:'<p class="game-perfect">Không trượt một ghềnh nào — Thần Long giáng thế!</p>';
  guessPanel.innerHTML=`<div class="dictation-shell"><div class="score-card"><span class="level-badge">${win?'Cá chép hóa rồng!':'Kết thúc ván'}</span><h3>Cá Chép Vượt Vũ Môn · Bài ${l.num}</h3><div class="score">${t.score} điểm</div><p>${win?'Bạn đã vượt <strong>Long Môn</strong> — Cá chép chính thức hóa Rồng Ngọc!':'Ghềnh đã vượt: <strong>'+t.bestStage+'/'+t.maxStage+'</strong>'} · Chuỗi cao nhất: <strong>${t.bestStreak}</strong>${win?' (gồm +50đ thưởng Hóa Rồng)':''}</p>${missedHtml}${srsCtaHTML()}<button class="action game-play" id="towerPlay">Vượt thác lại</button><button class="game-other" data-gallery-back>Chọn game khác</button></div></div>`;
  tower=null;
}
document.addEventListener('click',e=>{
  const _b=e.target.closest?e.target.closest('button'):null;const _id=_b?_b.id:e.target.id;
  if(_id==='towerPlay'||_id==='cpRestart'){startTower();return}
  if(_id==='cpPause'&&tower&&!tower.over){tower.paused=true;const v=$('#cpVeil');if(v)v.hidden=false;return}
  if(_id==='cpResume'&&tower){tower.paused=false;const v=$('#cpVeil');if(v)v.hidden=true;return}
  if(_id==='cpSpeak'&&tower&&tower.round){const v=lessons[activeLesson].vocab[tower.round.idx];if(v)speak(v.word);return}
  if(_id==='towerQuit'){stopTower();renderGuess();return}
  const st=e.target.closest('[data-cp-stone]');
  if(st&&tower&&!tower.over&&!tower.paused){towerAnswerLane(+st.dataset.cpStone,false);return}
  const lh=e.target.closest('[data-cp-lane-hit]');
  if(lh&&tower&&!tower.over&&!tower.paused){
    const k=+lh.dataset.cpLaneHit;
    if(tower.lane===k)towerAnswerLane(k,false);
    else{tower.lane=k;updateCpCarpPos();}
  }
});
document.addEventListener('keydown',e=>{
  if(!tower||tower.over||tower.paused||activeTab!=='guess')return;
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();tower.lane=Math.max(0,tower.lane-1);updateCpCarpPos();return}
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();tower.lane=Math.min(3,tower.lane+1);updateCpCarpPos();return}
  if(e.key===' '||e.key==='ArrowUp'||e.key==='Enter'){e.preventDefault();towerAnswerLane(tower.lane,false);return}
  const map={'1':0,'2':1,'3':2,'4':3};
  if(e.key in map){e.preventDefault();towerAnswerLane(map[e.key],false);}
});
function renderFlash(){const l=lessons[activeLesson],v=flashDeck[flashIndex];flashTitle.textContent=`Bài ${l.num} · Chạm thẻ để lật`;flashCount.textContent=`${flashIndex+1} / ${flashDeck.length}`;flashCard.classList.remove('flipped');strokeRun++;strokePlaying=false;flashStroke.disabled=false;flashStroke.textContent='Bút thuận';flashCard.innerHTML=`<div class="flash-front"><div class="word">${esc(v.word)}</div></div><div class="flash-back"><div class="word">${esc(v.word)}</div><div class="pinyin">${esc(v.pinyin)}</div><p class="meaning">${esc(v.meaning)}</p><p class="han">${esc(v.example)}</p><p class="example-pinyin pinyin">${esc(v.examplePinyin)}</p><p class="vi">${esc(v.exampleVi)}</p></div>`;flashStroke.style.display='';}
let auIdx=-1,auLessonNum=null;function auReset(){auIdx=-1;auLessonNum=null}function selectLesson(i){activeLesson=i;currentGame=null;resetVocabState(lessons[i].num);stopAllOrigAudio(true);auReset();renderAll();pushRoute();window.scrollTo({top:document.querySelector('.layout').offsetTop-10,behavior:'smooth'})}
let cannon=null,cannonRaf=0,toneG=null;
function normPinyin(p){const m={'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e','ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o','ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u','ü':'u','ê':'e','Ā':'a','Á':'a','Ǎ':'a','À':'a','Ē':'e','É':'e','Ě':'e','È':'e','Ī':'i','Í':'i','Ǐ':'i','Ì':'i','Ō':'o','Ó':'o','Ǒ':'o','Ò':'o','Ū':'u','Ú':'u','Ǔ':'u','Ù':'u','Ǖ':'u','Ǘ':'u','Ǚ':'u','Ǜ':'u','Ü':'u','Ê':'e'};return String(p).split('').map(c=>m[c]||c).join('').toLowerCase().replace(/[\s'’·]/g,'').replace(/v/g,'u')}
function stripTones(p){const m={'ā':'a','á':'a','ǎ':'a','à':'a','ē':'e','é':'e','ě':'e','è':'e','ī':'i','í':'i','ǐ':'i','ì':'i','ō':'o','ó':'o','ǒ':'o','ò':'o','ū':'u','ú':'u','ǔ':'u','ù':'u','ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü','ê':'ê'};return String(p).split('').map(c=>m[c]||c).join('')}
const TONE_SETS={a:['ā','á','ǎ','à'],e:['ē','é','ě','è'],i:['ī','í','ǐ','ì'],o:['ō','ó','ǒ','ò'],u:['ū','ú','ǔ','ù'],ü:['ǖ','ǘ','ǚ','ǜ']};
const TONE_OF={};Object.keys(TONE_SETS).forEach(b=>TONE_SETS[b].forEach((ch,i)=>TONE_OF[ch]={base:b,tone:i}));
function toneVariants(pinyin,count){const chars=[...pinyin],out=[];chars.forEach((ch,idx)=>{const t=TONE_OF[ch];if(!t)return;TONE_SETS[t.base].forEach((alt,ti)=>{if(ti===t.tone)return;const v=[...chars];v[idx]=alt;out.push(v.join(''))})});return shuffleArr([...new Set(out)].filter(x=>x!==pinyin)).slice(0,count)}
function heartsHTML(n){const full='<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 19.2C6.4 15.7 3 12.7 3 9.4 3 7 4.9 5.2 7.1 5.2c1.4 0 2.9.8 3.9 2.1 1-1.3 2.5-2.1 3.9-2.1 2.2 0 4.1 1.8 4.1 4.2 0 3.3-3.4 6.3-8 9.8z"/></svg>';const empty='<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 19.2C6.4 15.7 3 12.7 3 9.4 3 7 4.9 5.2 7.1 5.2c1.4 0 2.9.8 3.9 2.1 1-1.3 2.5-2.1 3.9-2.1 2.2 0 4.1 1.8 4.1 4.2 0 3.3-3.4 6.3-8 9.8z"/></svg>';let h='';for(let i=0;i<3;i++)h+=`<span class="heart${i<n?' on':''}">${i<n?full:empty}</span>`;return h}

function cannonArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Pháo đài Pinyin"><rect width="120" height="84" fill="#EEF4F1"/><circle cx="96" cy="20" r="10" fill="#D5E5DF" opacity=".8"/><path d="M0 72 L120 72 L120 84 L0 84 Z" fill="#D5E3DE"/><g><rect x="14" y="12" width="36" height="28" rx="7" fill="#FFFFFF" stroke="#2E7D6B" stroke-width="1.5"/><text x="32" y="31" text-anchor="middle" font-size="16" font-weight="800" fill="#193B39">学</text></g><g><path d="M44 68 L76 68 L70 52 L50 52 Z" fill="#7B5C43" stroke="#2F3E44" stroke-width="1.2"/><g transform="rotate(20 60 54)"><rect x="54" y="24" width="12" height="32" rx="6" fill="#2F3E44" stroke="#78909C" stroke-width="1.4"/><rect x="52" y="21" width="16" height="6" rx="3" fill="#B88A36" stroke="#2F3E44" stroke-width="1"/></g><circle cx="48" cy="66" r="6" fill="#7B5C43" stroke="#2F3E44" stroke-width="1.6"/><circle cx="72" cy="66" r="6" fill="#7B5C43" stroke="#2F3E44" stroke-width="1.6"/></g><circle cx="75" cy="32" r="3" fill="#2F3E44"/><circle cx="84" cy="23" r="2.2" fill="#B88A36"/></svg>`}
function rainArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Từ rơi"><rect width="120" height="84" fill="#EEF4F1"/><path d="M0 72 Q60 62 120 72 L120 84 L0 84 Z" fill="#A54432" opacity=".85"/><rect x="8" y="69" width="104" height="4" rx="2" fill="#E7CB6E"/><g><line x1="29" y1="0" x2="29" y2="10" stroke="#A54432" stroke-width="1.5"/><rect x="14" y="8" width="30" height="30" rx="8" fill="#FFFDF4" stroke="#2E7D6B" stroke-width="1.5"/><text x="29" y="29" text-anchor="middle" font-size="16" font-weight="800" fill="#193B39">词</text></g><g><line x1="63" y1="0" x2="63" y2="24" stroke="#B98A2F" stroke-width="1.5"/><rect x="48" y="22" width="30" height="30" rx="8" fill="#FFF8E1" stroke="#B98A2F" stroke-width="1.8"/><text x="63" y="43" text-anchor="middle" font-size="16" font-weight="800" fill="#A54432">语</text></g><g><line x1="95" y1="0" x2="95" y2="12" stroke="#A54432" stroke-width="1.5"/><rect x="80" y="10" width="30" height="30" rx="8" fill="#FFFDF4" stroke="#2E7D6B" stroke-width="1.5"/><text x="95" y="31" text-anchor="middle" font-size="16" font-weight="800" fill="#193B39">雨</text></g></svg>`}
function carpArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Cá chép hóa rồng"><rect width="120" height="84" fill="#E3F4FA"/><rect x="44" y="20" width="32" height="54" rx="8" fill="#A6DAEE" opacity=".75"/><path d="M30 16 Q60 4 90 16 L85 21 Q60 11 35 21 Z" fill="#D4A238" stroke="#193B39" stroke-width="1"/><rect x="38" y="20" width="5" height="15" fill="#2E7D6B"/><rect x="77" y="20" width="5" height="15" fill="#2E7D6B"/><rect x="49" y="14" width="22" height="11" rx="3" fill="#FFFFFF" stroke="#D4A238" stroke-width="1.2"/><text x="60" y="22.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#193B39">龙门</text><path d="M60 33 C68 41 70 50 65 58 C62 62 60 66 60 70 C60 66 58 62 55 58 C50 50 52 41 60 33Z" fill="#F2B42C" stroke="#C67C13" stroke-width="1.2"/><circle cx="60" cy="41" r="2" fill="#193B39"/><path d="M44 66 q16 -8 32 0 M38 74 q22 -8 44 0" stroke="#3B93B3" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`}
function toneArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Luyện thanh điệu"><rect width="120" height="84" fill="#F7EFE0"/><circle cx="60" cy="42" r="32" fill="#FFFDF7" stroke="#E7CB6E" stroke-width="1.5"/><g stroke-width="2.8" stroke-linecap="round" fill="none"><path d="M16 26 H38" stroke="#A54432"/><path d="M16 46 L38 32" stroke="#B98A2F"/><path d="M82 32 L90 42 L104 28" stroke="#2E7D6B"/><path d="M82 50 L104 64" stroke="#193B39"/></g><text x="60" y="49" text-anchor="middle" font-size="22" font-weight="800" fill="#193B39">音</text></svg>`}
function karaokeArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Karaoke đọc đuổi"><rect width="120" height="84" fill="#EEF4F1"/><rect x="14" y="14" width="92" height="40" rx="8" fill="#FFFFFF" stroke="#2E7D6B" stroke-width="1.5"/><text x="34" y="39" text-anchor="middle" font-size="15" font-weight="800" fill="#2E7D6B">你</text><text x="54" y="39" text-anchor="middle" font-size="15" font-weight="800" fill="#2E7D6B">好</text><text x="76" y="39" text-anchor="middle" font-size="15" font-weight="800" fill="#9AA8B5">吗</text><rect x="24" y="45" width="40" height="3.5" rx="1.75" fill="#2E7D6B"/><rect x="64" y="45" width="24" height="3.5" rx="1.75" fill="#D5E3DE"/><circle cx="60" cy="68" r="10" fill="#A54432"/><rect x="57.5" y="62" width="5" height="8" rx="2.5" fill="#FFFFFF"/><path d="M55 68 a5 5 0 0 0 10 0 M60 73 v3" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`}
function gameCardsHTML(){const l=lessons[activeLesson];return `<div class="dictation-shell"><div class="gz-head"><span class="level-badge">Khu trò chơi</span><h3 class="game-title">Trò chơi · Bài ${l.num}</h3><p class="gz-sub">Chọn một game để chơi. Điểm chỉ tính trong ván này, tải lại trang là chơi lại từ đầu.</p></div><div class="gz-grid"><article class="gz-card"><div class="gz-art">${cannonArtSVG()}</div><div class="gz-cn">炮火拼音</div><h4>Pháo đài Pinyin</h4><p class="gz-desc">Gõ đúng pinyin để pháo bắn hạ hết từ trong bài.</p><button class="action gz-play" data-game="cannon">Chơi ngay</button></article><article class="gz-card"><div class="gz-art">${karaokeArtSVG()}</div><div class="gz-cn">课文跟读</div><h4>Karaoke đọc đuổi</h4><p class="gz-desc">Đọc đuổi theo từng câu hội thoại bài khóa bằng micro với 3 mức tốc độ.</p><button class="action gz-play" data-game="karaoke">Chơi ngay</button></article><article class="gz-card"><div class="gz-art">${rainArtSVG()}</div><div class="gz-cn">词语雨</div><h4>Từ rơi</h4><p class="gz-desc">Từ rơi từ trên xuống, chạm đúng nghĩa tiếng Việt trước khi chạm đất.</p><button class="action gz-play" data-game="fall">Chơi ngay</button></article><article class="gz-card"><div class="gz-art">${carpArtSVG()}</div><div class="gz-cn">鲤鱼跃龙门</div><h4>Cá chép hóa rồng</h4><p class="gz-desc">Lái cá chép bơi vượt 10 ghềnh thác, chọn đúng đá ngọc để hóa rồng.</p><button class="action gz-play" data-game="carp">Chơi ngay</button></article></div></div>`}
/* ===== SÁCH BÀI TẬP (workbook) — HSK1 听读练 + 模拟测练 ===== */
const WB_SUBMIT_URL='https://script.google.com/macros/s/AKfycbxzlnGx2Vn8FSw4YMF9zt9kick_-pLQzY2JxXUYz5hyzoxtedXkhpp7fUPINXpb6GDn/exec';
let wbState=null;
let wbAudioEl=null;
function wbLessonData(){try{if(typeof workbook1==='undefined')return null;return workbook1[String(lessons[activeLesson].num)]||null;}catch(e){return null;}}
function wbHasData(){return !!wbLessonData();}
function wbAudioSrc(){const d=wbLessonData();return d?('assets/audio/h1/'+d.audio):'';}
function wbPlaySegment(src,start,end){
  try{
    if(!wbAudioEl){wbAudioEl=new Audio();wbAudioEl.preload='auto';}
    const stopAt=end+0.10;
    if(wbAudioEl._wbStop)wbAudioEl.removeEventListener('timeupdate',wbAudioEl._wbStop);
    wbAudioEl._wbStop=function(){if(wbAudioEl.currentTime>=stopAt){wbAudioEl.pause();wbAudioEl.removeEventListener('timeupdate',wbAudioEl._wbStop);}};
    wbAudioEl.addEventListener('timeupdate',wbAudioEl._wbStop);
    const playFrom=function(){try{wbAudioEl.currentTime=Math.max(0,start-0.05);}catch(e){}wbAudioEl.play().catch(function(){});};
    if(wbAudioEl.getAttribute('src')!==src){wbAudioEl.src=src;wbAudioEl.addEventListener('loadedmetadata',playFrom,{once:true});wbAudioEl.load();}
    else{playFrom();}
  }catch(e){}
}
const WB_TONE_MAP={'ā':['a',1],'á':['a',2],'ǎ':['a',3],'à':['a',4],'ō':['o',1],'ó':['o',2],'ǒ':['o',3],'ò':['o',4],'ē':['e',1],'é':['e',2],'ě':['e',3],'è':['e',4],'ī':['i',1],'í':['i',2],'ǐ':['i',3],'ì':['i',4],'ū':['u',1],'ú':['u',2],'ǔ':['u',3],'ù':['u',4],'ǖ':['ü',1],'ǘ':['ü',2],'ǚ':['ü',3],'ǜ':['ü',4]};
function wbParsePinyin(s){
  s=String(s||'').trim().toLowerCase().replace(/v/g,'ü');
  if(!s)return{base:'',tone:0};
  const m=s.match(/^([a-zü]+)([1-4])$/);
  if(m)return{base:m[1],tone:+m[2]};
  let base='',tone=0;
  for(const ch of s){
    if(WB_TONE_MAP[ch]){base+=WB_TONE_MAP[ch][0];tone=WB_TONE_MAP[ch][1];}
    else base+=ch;
  }
  return{base:base,tone:tone};
}
function wbPinyinEqual(a,b){
  const x=wbParsePinyin(a),y=wbParsePinyin(b);
  return x.base===y.base&&x.tone===y.tone;
}
function wbScorableItems(d){
  const items=[];
  if(d.exercises){
    d.exercises.forEach(function(ex){
      if(['fill-initial','fill-final','fill-tone','choose-syllable','choose-word','picture-mcq'].indexOf(ex.type)>=0){
        ex.items.forEach(function(it){items.push({key:'ex'+ex.no+'-'+it.no,ex:ex,it:it});});
      }
    });
  }
  if(d.listening)d.listening.items.forEach(function(it){items.push({key:'lis-'+it.no,ex:null,it:it,part:'listening'});});
  if(d.reading)d.reading.items.forEach(function(it){items.push({key:'read-'+it.no,ex:null,it:it,part:'reading'});});
  return items;
}
function wbTotal(d){return wbScorableItems(d).length;}
function wbCorrect(d){return wbScorableItems(d).filter(function(x){const a=wbState&&wbState.answers[x.key];return a&&a.correct;}).length;}
function wbFindItem(d,key){
  if(key.indexOf('ex')===0){
    const m=key.match(/^ex(\d+)-(\d+)$/);
    if(!m)return null;
    const ex=(d.exercises||[]).find(function(e){return e.no===+m[1];});
    if(!ex)return null;
    const it=ex.items.find(function(x){return x.no===+m[2];});
    if(!it)return null;
    if(ex.type==='fill-tone')return{answer:it.answer,display:'Thanh '+it.answer,type:ex.type};
    if(ex.type==='fill-initial'||ex.type==='fill-final')return{answer:it.answer,display:it.full||it.answer,type:ex.type};
    if(it.options&&/^[A-D]$/.test(String(it.answer))){
      const idx='ABCD'.indexOf(it.answer);
      return{answer:it.options[idx],display:it.options[idx],type:ex.type};
    }
    return{answer:it.answer,display:it.answer,type:ex.type};
  }
  if(key.indexOf('lis-')===0){
    const it=(d.listening?d.listening.items:[]).find(function(x){return x.no===+key.slice(4);});
    if(!it)return null;
    const idx='ABCD'.indexOf(it.answer);
    return{answer:it.options[idx],display:it.options[idx],type:'moni'};
  }
  if(key.indexOf('read-')===0){
    const it=(d.reading?d.reading.items:[]).find(function(x){return x.no===+key.slice(5);});
    if(!it)return null;
    const idx='ABCD'.indexOf(it.answer);
    return{answer:it.options[idx],display:it.options[idx],type:'moni'};
  }
  return null;
}
function wbNick(){
  try{
    var p=JSON.parse(localStorage.getItem('hoc-hsk-lb-v1')||'null');
    if(p&&p.name)return String(p.name).trim();
  }catch(e){}
  return '';
}
function wbAnswered(d){return wbScorableItems(d).filter(function(x){return wbState&&wbState.answers[x.key];}).length;}
function wbOptClass(ans,v){
  if(!ans||ans.given!==v)return '';
  if(!wbState.checked)return ' wb-chosen';
  return ans.correct?' wb-chosen-ok':' wb-chosen-bad';
}
function wbUpdateScore(){
  const el=document.getElementById('wbScore');
  if(!el||!wbState)return;
  const d=wbLessonData();
  if(!d)return;
  const total=wbTotal(d),correct=wbCorrect(d),answered=wbAnswered(d);
  el.textContent=wbState.checked?('Đúng '+correct+'/'+total+' câu'):('Đã làm '+answered+'/'+total+' câu');
  const bar=document.getElementById('wbScoreBar');
  if(bar)bar.style.width=(total?Math.round((wbState.checked?correct:answered)/total*100):0)+'%';
  const sub=document.getElementById('wbScoreLine');
  if(sub)sub.innerHTML=wbState.checked?('Điểm của bạn: <strong>'+correct+'/'+total+'</strong>'):('Đã làm <strong>'+answered+'/'+total+'</strong> câu. Bấm Kiểm tra đáp án để xem điểm nhé.');
}
function wbMarkAnswered(btn,key){
  const box=document.querySelector('[data-wb-item="'+key+'"]');
  if(box){
    box.querySelectorAll('button[data-wb-opt],button[data-wb-tone],button[data-wb-check]').forEach(function(b){b.disabled=true;});
    const inp=box.querySelector('input.wb-input');if(inp)inp.disabled=true;
  }
  if(btn)btn.classList.add('wb-chosen');
}
function wbMarkItem(btn,key,correct,correctAnswer){
  const box=document.querySelector('[data-wb-item="'+key+'"]');
  if(box){
    box.classList.add(correct?'wb-correct':'wb-wrong');
    const fb=box.querySelector('.wb-feedback');
    if(fb)fb.innerHTML=correct?'<span class="wb-ok">✓ Đúng rồi!</span>':'<span class="wb-bad">✗ Chưa đúng. Đáp án: <strong>'+esc(correctAnswer)+'</strong></span>';
    box.querySelectorAll('button[data-wb-opt],button[data-wb-tone],button[data-wb-check]').forEach(function(b){b.disabled=true;});
    const inp=box.querySelector('input.wb-input');if(inp)inp.disabled=true;
  }
  if(btn)btn.classList.add(correct?'wb-chosen-ok':'wb-chosen-bad');
}
function wbAnswerOpt(btn,key,val){
  if(!wbState||wbState.answers[key])return;
  const d=wbLessonData();if(!d)return;
  const found=wbFindItem(d,key);if(!found)return;
  const correct=val===found.answer;
  wbState.answers[key]={given:val,correct:correct,correctAnswer:found.display};
  wbMarkAnswered(btn,key);
  wbUpdateScore();
}
function wbAnswerTone(btn,key,val){
  if(!wbState||wbState.answers[key])return;
  const d=wbLessonData();if(!d)return;
  const found=wbFindItem(d,key);if(!found)return;
  const correct=String(val)===String(found.answer);
  wbState.answers[key]={given:'Thanh '+val,correct:correct,correctAnswer:'Thanh '+found.answer};
  wbMarkAnswered(btn,key);
  wbUpdateScore();
}
function wbCheckFill(key){
  if(!wbState||wbState.answers[key])return;
  const d=wbLessonData();if(!d)return;
  const found=wbFindItem(d,key);if(!found)return;
  const inp=document.getElementById('wb-in-'+key);
  const val=inp?inp.value.trim():'';
  if(!val){if(inp)inp.focus();return;}
  let correct=false;
  if(found.type==='fill-initial'){correct=val.toLowerCase()===String(found.answer).toLowerCase();}
  else{correct=wbPinyinEqual(val,found.answer);}
  wbState.answers[key]={given:val,correct:correct,correctAnswer:found.display};
  wbMarkAnswered(null,key);
  wbUpdateScore();
}
function wbCheckAll(){
  if(!wbState||wbState.checked)return;
  const d=wbLessonData();if(!d)return;
  wbScorableItems(d).forEach(function(x){
    if(!wbState.answers[x.key]){
      const found=wbFindItem(d,x.key);
      wbState.answers[x.key]={given:'',correct:false,correctAnswer:found?found.display:''};
    }
  });
  wbState.checked=true;
  wbScorableItems(d).forEach(function(x){
    const a=wbState.answers[x.key];
    wbMarkItem(null,x.key,a.correct,a.correctAnswer);
  });
  wbUpdateScore();
  const b=document.getElementById('wbCheck');if(b)b.disabled=true;
  const msg=document.getElementById('wbSubmitMsg');
  if(msg)msg.textContent='Bạn làm đúng '+wbCorrect(d)+'/'+wbTotal(d)+' câu!';
}
function wbSubmit(){
  const msgEl=document.getElementById('wbSubmitMsg');
  const nick=wbNick();
  if(!nick){if(msgEl)msgEl.innerHTML='Bạn chưa có tên nick. Vào <a href="/bang-xep-hang">Bảng xếp hạng</a> để đặt tên nick rồi quay lại nộp nhé.';return;}
  const d=wbLessonData();if(!d)return;
  const total=wbTotal(d),correct=wbCorrect(d);
  const mins=Math.max(1,Math.round((Date.now()-wbState.startTs)/60000));
  const score=correct+'/'+total;
  if(msgEl)msgEl.textContent='Đang gửi…';
  fetch(WB_SUBMIT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({name:nick,lesson:'Bài '+wbState.lesson,time:mins+' phút',score:score})})
  .then(function(){wbState.submitted=true;wbState.submitMsg='Đã gửi kết quả cho giáo viên. Cảm ơn bạn!';if(msgEl)msgEl.textContent=wbState.submitMsg;const b=document.getElementById('wbSubmit');if(b)b.disabled=true;})
  .catch(function(){if(msgEl)msgEl.textContent='Gửi chưa được, kiểm tra mạng rồi bấm gửi lại nhé.';});
}
function wbReset(){
  if(!wbState)return;
  wbState.answers={};wbState.startTs=Date.now();wbState.submitted=false;wbState.submitMsg='';wbState.checked=false;
  renderWorkbook();
}
function wbItemHTML(d,ex,it){
  const key='ex'+ex.no+'-'+it.no;
  const ans=wbState.answers[key];
  const src=wbAudioSrc();
  const playBtn=it.audioRange?'<button class="wb-play" data-wb-play data-src="'+src+'" data-start="'+it.audioRange[0]+'" data-end="'+it.audioRange[1]+'">▶ Nghe</button>':'';
  let h='<div class="wb-item" data-wb-item="'+key+'">';
  h+='<div class="wb-item-head"><span class="wb-item-no">'+it.no+'.</span>'+playBtn;
  if(ex.type==='fill-initial'||ex.type==='fill-final'||ex.type==='fill-tone'){
    h+='<span class="wb-printed">'+esc(it.printed)+'</span>';
  }else if(ex.type==='read-aloud'){
    h+='<span class="wb-text">'+esc(it.text)+'</span>';
  }else if(ex.type==='distinguish'){
    h+='<span class="wb-text">'+esc(it.pair[0])+' / '+esc(it.pair[1])+'</span>';
  }
  h+='</div>';
  if(ex.type==='fill-initial'||ex.type==='fill-final'){
    h+='<div class="wb-fill-row"><input id="wb-in-'+key+'" class="wb-input" placeholder="'+(ex.type==='fill-initial'?'Gõ thanh mẫu…':'Gõ vận mẫu (có dấu thanh, ví dụ: ā hoặc a1)…')+'" autocomplete="off"'+(ans?' disabled value="'+esc(ans.given)+'"':'')+'><button class="action wb-check" data-wb-check="'+key+'"'+(ans?' disabled':'')+'>Xong</button></div>';
  }else if(ex.type==='fill-tone'){
    h+='<div class="wb-tone-row">'+[1,2,3,4].map(function(t){return '<button class="wb-tone-btn'+wbOptClass(ans,'Thanh '+t)+'" data-wb-tone="'+key+'" data-val="'+t+'"'+(ans?' disabled':'')+'>Thanh '+t+'</button>';}).join('')+'</div>';
  }else if(ex.type==='choose-syllable'||ex.type==='choose-word'){
    h+='<div class="wb-opts">'+it.options.map(function(o,i){return '<button class="wb-opt'+wbOptClass(ans,o)+'" data-wb-opt="'+key+'" data-val="'+esc(o)+'"'+(ans?' disabled':'')+'><span class="ans-num">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></button>';}).join('')+'</div>';
  }else if(ex.type==='picture-mcq'){
    const pic='assets/workbook-photos/wb-l'+wbState.lesson+'-'+ex.no+'-'+it.no+'.jpg';
    h+='<div class="wb-pic"><img src="'+pic+'" alt="Hình minh họa câu '+it.no+'" loading="lazy"></div>';
    h+='<div class="wb-opts">'+it.options.map(function(o,i){return '<button class="wb-opt'+wbOptClass(ans,o)+'" data-wb-opt="'+key+'" data-val="'+esc(o)+'"'+(ans?' disabled':'')+'><span class="ans-num">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></button>';}).join('')+'</div>';
  }else if(ex.type==='read-aloud'||ex.type==='distinguish'){
    h+='<p class="wb-note">Nghe rồi đọc to theo, không tính điểm.</p>';
  }
  h+='<div class="wb-feedback">'+(ans&&wbState.checked?(ans.correct?'<span class="wb-ok">✓ Đúng rồi!</span>':'<span class="wb-bad">✗ Chưa đúng. Đáp án: <strong>'+esc(ans.correctAnswer)+'</strong></span>'):'')+'</div>';
  h+='</div>';
  return h;
}
function wbMoniListenHTML(d,it){
  const key='lis-'+it.no;
  const ans=wbState.answers[key];
  const src=wbAudioSrc();
  let h='<div class="wb-item" data-wb-item="'+key+'">';
  h+='<div class="wb-item-head"><span class="wb-item-no">'+it.no+'.</span><button class="wb-play" data-wb-play data-src="'+src+'" data-start="'+it.audioRange[0]+'" data-end="'+it.audioRange[1]+'">▶ Nghe</button></div>';
  h+='<p class="wb-question">'+esc(it.question)+'</p>';
  if(it.pictureDesc)h+='<p class="wb-picdesc">'+esc(it.pictureDesc)+'</p>';
  h+='<div class="wb-opts">'+it.options.map(function(o,i){return '<button class="wb-opt'+wbOptClass(ans,o)+'" data-wb-opt="'+key+'" data-val="'+esc(o)+'"'+(ans?' disabled':'')+'><span class="ans-num">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></button>';}).join('')+'</div>';
  h+='<div class="wb-feedback">'+(ans&&wbState.checked?(ans.correct?'<span class="wb-ok">✓ Đúng rồi!</span>':'<span class="wb-bad">✗ Chưa đúng. Đáp án: <strong>'+esc(ans.correctAnswer)+'</strong></span>'):'')+'</div>';
  h+='</div>';
  return h;
}
function wbMoniReadHTML(d,it){
  const key='read-'+it.no;
  const ans=wbState.answers[key];
  let h='<div class="wb-item" data-wb-item="'+key+'">';
  h+='<div class="wb-item-head"><span class="wb-item-no">'+it.no+'.</span></div>';
  if(it.passage)h+='<p class="wb-passage">'+esc(it.passage)+'</p>';
  if(it.question)h+='<p class="wb-question">'+esc(it.question)+'</p>';
  if(it.optionsDesc)h+='<p class="wb-picdesc">'+esc(it.optionsDesc)+'</p>';
  h+='<div class="wb-opts">'+it.options.map(function(o,i){return '<button class="wb-opt'+wbOptClass(ans,o)+'" data-wb-opt="'+key+'" data-val="'+esc(o)+'"'+(ans?' disabled':'')+'><span class="ans-num">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></button>';}).join('')+'</div>';
  h+='<div class="wb-feedback">'+(ans&&wbState.checked?(ans.correct?'<span class="wb-ok">✓ Đúng rồi!</span>':'<span class="wb-bad">✗ Chưa đúng. Đáp án: <strong>'+esc(ans.correctAnswer)+'</strong></span>'):'')+'</div>';
  h+='</div>';
  return h;
}
function wbSubmitHTML(l,d){
  const total=wbTotal(d),correct=wbCorrect(d),answered=wbAnswered(d);
  const nick=wbNick();
  const line=wbState.checked?('Điểm của bạn: <strong>'+correct+'/'+total+'</strong>'):('Đã làm <strong>'+answered+'/'+total+'</strong> câu. Bấm Kiểm tra đáp án để xem điểm nhé.');
  const nickLine=nick?('Tên nick sẽ nộp: <strong>'+esc(nick)+'</strong>'):('Chưa có tên nick. Vào <a href="/bang-xep-hang">Bảng xếp hạng</a> để đặt tên nick trước khi nộp nhé.');
  return '<article class="grammar-card wb-submit"><div class="grammar-title">Kiểm tra và nộp bài</div><div class="grammar-body">'
  +'<p id="wbScoreLine">'+line+'</p>'
  +'<p class="wb-note">'+nickLine+'</p>'
  +'<div class="wb-submit-row"><button class="action" id="wbCheck"'+(wbState.checked?' disabled':'')+'>Kiểm tra đáp án</button><button class="action" id="wbSubmit"'+(wbState.submitted?' disabled':'')+'>Nộp cho giáo viên</button><button class="game-other" id="wbRetry">Làm lại</button></div>'
  +'<p id="wbSubmitMsg">'+esc(wbState.submitMsg||'')+'</p>'
  +'</div></article>';
}
function wbPanelHTML(l,d){
  const total=wbTotal(d),correct=wbCorrect(d);
  let h='<button class="back-to-zone" data-tab="practice">← Tất cả dạng luyện tập</button>';
  h+='<div class="dictation-shell">';
  h+='<div class="gz-head"><span class="level-badge">Sách bài tập</span><h3 class="game-title">Sách bài tập · Bài '+l.num+'</h3><p class="gz-sub">'+esc(d.section)+' · '+esc(d.sectionVi)+' · '+total+' câu chấm điểm</p></div>';
  const answered=wbAnswered(d);
  h+='<div class="wb-score"><span id="wbScore">'+(wbState.checked?('Đúng '+correct+'/'+total+' câu'):('Đã làm '+answered+'/'+total+' câu'))+'</span><div class="quiz-progress"><i id="wbScoreBar" style="width:'+(total?Math.round((wbState.checked?correct:answered)/total*100):0)+'%"></i></div></div>';
  h+=origAudioHTML(wbAudioSrc(),'Nghe toàn bài · '+d.audio);
  if(d.exercises){
    d.exercises.forEach(function(ex){
      h+='<article class="grammar-card wb-ex"><div class="grammar-title"><span class="g-num">'+ex.no+'.</span> '+esc(ex.title)+'</div><div class="grammar-body">';
      h+='<p>'+esc(ex.titleVi)+'</p>';
      if(ex.instructionRange)h+='<button class="wb-play" data-wb-play data-src="'+wbAudioSrc()+'" data-start="'+ex.instructionRange[0]+'" data-end="'+ex.instructionRange[1]+'">▶ Nghe hướng dẫn</button>';
      else if(ex.audioRange)h+='<button class="wb-play" data-wb-play data-src="'+wbAudioSrc()+'" data-start="'+ex.audioRange[0]+'" data-end="'+ex.audioRange[1]+'">▶ Nghe toàn bài tập</button>';
      ex.items.forEach(function(it){h+=wbItemHTML(d,ex,it);});
      h+='</div></article>';
    });
  }
  if(d.listening){
    h+='<article class="grammar-card wb-ex"><div class="grammar-title">一、听力 <span style="font-weight:600;color:var(--muted);font-size:.95rem">(Phần nghe)</span></div><div class="grammar-body">';
    d.listening.items.forEach(function(it){h+=wbMoniListenHTML(d,it);});
    h+='</div></article>';
  }
  if(d.reading){
    h+='<article class="grammar-card wb-ex"><div class="grammar-title">二、阅读 <span style="font-weight:600;color:var(--muted);font-size:.95rem">(Phần đọc)</span></div><div class="grammar-body">';
    d.reading.items.forEach(function(it){h+=wbMoniReadHTML(d,it);});
    h+='</div></article>';
  }
  h+=wbSubmitHTML(l,d);
  h+='</div>';
  return h;
}
function renderWorkbook(){
  const panel=document.getElementById('workbookPanel');
  if(!panel)return;
  if(activeTab!=='workbook')return;
  const l=lessons[activeLesson];
  const d=wbLessonData();
  if(!d){
    panel.innerHTML='<button class="back-to-zone" data-tab="practice">← Tất cả dạng luyện tập</button><div class="dictation-shell"><div class="score-card"><span class="level-badge">Sắp ra mắt</span><h3>Sách bài tập · Bài '+l.num+'</h3><p>Phần này đang được biên soạn, sẽ ra mắt sau nhé.</p><button class="action" data-tab="practice">Chọn dạng luyện tập khác</button></div></div>';
    return;
  }
  if(!wbState||wbState.lesson!==l.num){
    wbState={lesson:l.num,startTs:Date.now(),answers:{},submitted:false,submitMsg:'',checked:false};
  }
  panel.innerHTML=wbPanelHTML(l,d);
}
function workbookArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Sách bài tập"><rect width="120" height="84" fill="#f3ead8"/><rect x="30" y="12" width="60" height="60" rx="4" fill="#ffffff" stroke="#173f63" stroke-width="2"/><rect x="30" y="12" width="9" height="60" fill="#d9a441"/><rect x="46" y="22" width="34" height="4" rx="2" fill="#173f63"/><rect x="46" y="32" width="34" height="4" rx="2" fill="#9aa8b5"/><rect x="46" y="42" width="22" height="4" rx="2" fill="#9aa8b5"/><rect x="46" y="54" width="28" height="4" rx="2" fill="#c8452c"/></svg>`}
document.addEventListener('click',e=>{
  const pl=e.target.closest('[data-wb-play]');
  if(pl){wbPlaySegment(pl.dataset.src,+pl.dataset.start,+pl.dataset.end);return;}
  const opt=e.target.closest('[data-wb-opt]');
  if(opt&&!opt.disabled){wbAnswerOpt(opt,opt.dataset.wbOpt,opt.dataset.val);return;}
  const tn=e.target.closest('[data-wb-tone]');
  if(tn&&!tn.disabled){wbAnswerTone(tn,tn.dataset.wbTone,tn.dataset.val);return;}
  const ck=e.target.closest('[data-wb-check]');
  if(ck&&!ck.disabled){wbCheckFill(ck.dataset.wbCheck);return;}
  if(e.target.id==='wbCheck'){wbCheckAll();return;}
  if(e.target.id==='wbSubmit'){wbSubmit();return;}
  if(e.target.id==='wbRetry'){wbReset();return;}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.id&&e.target.id.indexOf('wb-in-')===0){e.preventDefault();wbCheckFill(e.target.id.slice(6));}
});

function flashArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Flashcard"><rect width="120" height="84" fill="#e9eff6"/><rect x="36" y="12" width="52" height="56" rx="6" fill="#d9a441" transform="rotate(6 60 40)"/><rect x="28" y="14" width="52" height="56" rx="6" fill="#ffffff" stroke="#173f63" stroke-width="2"/><rect x="38" y="26" width="32" height="5" rx="2.5" fill="#173f63"/><rect x="38" y="38" width="32" height="5" rx="2.5" fill="#c8452c"/><rect x="38" y="50" width="20" height="5" rx="2.5" fill="#9aa8b5"/></svg>`} function dictArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Nghe chép"><rect width="120" height="84" fill="#e2f0ec"/><path d="M36 58 V44 a24 24 0 0 1 48 0 V58" fill="none" stroke="#2e7d6b" stroke-width="5" stroke-linecap="round"/><rect x="30" y="54" width="12" height="16" rx="5" fill="#2e7d6b"/><rect x="78" y="54" width="12" height="16" rx="5" fill="#2e7d6b"/><rect x="52" y="64" width="16" height="5" rx="2.5" fill="#d9a441"/></svg>`} function fillArtSVG(){return `<svg viewBox="0 0 120 84" role="img" aria-label="Điền từ"><rect width="120" height="84" fill="#fbe9e4"/><rect x="18" y="38" width="24" height="6" rx="3" fill="#173f63"/><rect x="48" y="32" width="28" height="14" rx="3" fill="#ffffff" stroke="#c8452c" stroke-width="2" stroke-dasharray="4 3"/><rect x="82" y="38" width="20" height="6" rx="3" fill="#173f63"/><rect x="52" y="54" width="40" height="5" rx="2.5" fill="#9aa8b5"/></svg>`} function practiceCardsHTML(){const l=lessons[activeLesson];return `<div class="dictation-shell"><div class="gz-head"><span class="level-badge">Luyện tập</span><h3 class="game-title">Luyện tập · Bài ${l.num}</h3><p class="gz-sub">Chọn một dạng để luyện từ vựng và câu của bài.</p></div><div class="gz-grid"><article class="gz-card"><div class="gz-art">${flashArtSVG()}</div><div class="gz-cn">闪卡</div><h4>Flashcard</h4><p class="gz-desc">Lật thẻ để nhớ chữ Hán, pinyin và nghĩa của từ.</p><button class="action gz-play" data-flashcard>Luyện ngay</button></article>${wbHasData()?`<article class="gz-card"><div class="gz-art">${workbookArtSVG()}</div><div class="gz-cn">练习册</div><h4>Sách bài tập</h4><p class="gz-desc">Bài tập nghe, đọc trong sách bài tập HSK 1, làm xong gửi kết quả cho giáo viên.</p><button class="action gz-play" data-tab="workbook">Luyện ngay</button></article>`:`<article class="gz-card"><div class="gz-art">${workbookArtSVG()}</div><div class="gz-cn">练习册</div><h4>Sách bài tập</h4><p class="gz-desc">Bài tập nghe, đọc trong sách bài tập, đang được biên soạn.</p><button class="action gz-play" disabled>Sắp ra mắt</button></article>`}<article class="gz-card"><div class="gz-art">${dictArtSVG()}</div><div class="gz-cn">听写</div><h4>Nghe chép</h4><p class="gz-desc">Nghe câu rồi chép lại đúng chữ Hán.</p><button class="action gz-play" data-tab="quiz">Luyện ngay</button></article><article class="gz-card"><div class="gz-art">${fillArtSVG()}</div><div class="gz-cn">填空</div><h4>Điền từ</h4><p class="gz-desc">Điền từ đúng vào chỗ trống trong câu.</p><button class="action gz-play" data-tab="fill">Luyện ngay</button></article><article class="gz-card"><div class="gz-art">${toneArtSVG()}</div><div class="gz-cn">声调</div><h4>Luyện thanh điệu</h4><p class="gz-desc">Nghe từ rồi chọn đúng pinyin có dấu thanh. 10 câu một ván.</p><button class="action gz-play" data-tab="tone">Luyện ngay</button></article></div></div>`} function renderPracticeZone(){practicePanel.innerHTML=practiceCardsHTML()} function renderGallery(){stopGame();stopTower();stopCannon();stopKaraoke();guessPanel.innerHTML=gameCardsHTML()}
function renderFallIntro(){stopGame();stopTower();stopCannon();stopKaraoke();guessPanel.innerHTML=`<div class="dictation-shell"><div class="game-start"><span class="level-badge">Game từ rơi</span><h3 class="game-title">Từ Rơi Bắt Nghĩa</h3><div class="game-rules"><p><strong>Cách chơi:</strong> từ vựng của bài sẽ rơi từ trên xuống — chạm <strong>đúng nghĩa tiếng Việt</strong> trong 4 đáp án trước khi từ chạm đất. Mỗi từ trong bài rơi đúng 1 lần — bắt hết cả bài mà còn mạng là thắng.</p><p><strong>Mạng:</strong> chọn sai hoặc để từ rơi mất sẽ mất 1 mạng — bạn có 3 mạng. Chọn sai vẫn được chọn lại cho tới khi từ chạm đất, nhưng lượt đó không còn điểm.</p><p><strong>Combo:</strong> đúng liên tiếp để nhân điểm ×2 (chuỗi 3) · ×3 (chuỗi 6) · ×5 (chuỗi 10). Từ vàng ★ xuất hiện bất ngờ cho gấp 3 điểm!</p></div><button class="action game-play" id="gamePlay">Chơi ngay</button><button class="game-other" data-gallery-back>Chọn game khác</button><p class="game-note">Chơi trên máy tính: bấm phím 1–4 để chọn đáp án cho nhanh.</p></div></div>`}

function cannonSVG(){return `<svg viewBox="0 0 88 76" role="img" aria-label="Thần công"><ellipse cx="44" cy="70" rx="32" ry="4.5" fill="rgba(47,62,68,.16)"/><path d="M18 62 L70 62 L60 45 L28 45 Z" fill="#7B5C43" stroke="#2F3E44" stroke-width="1.8"/><g id="cnBarrel"><rect x="36" y="8" width="16" height="46" rx="7" fill="#2F3E44" stroke="#546E7A" stroke-width="1.5"/><rect x="33" y="6" width="22" height="8" rx="4" fill="#B88A36" stroke="#2F3E44" stroke-width="1.4"/><path d="M40 20 H48 M39 30 H49" stroke="#B88A36" stroke-width="2" stroke-linecap="round"/><circle cx="44" cy="52" r="10" fill="#546E7A" stroke="#2F3E44" stroke-width="2"/><circle cx="44" cy="52" r="4" fill="#E7CB6E"/></g><circle cx="24" cy="62" r="8" fill="#7B5C43" stroke="#2F3E44" stroke-width="2.2"/><circle cx="24" cy="62" r="3" fill="#D4A238"/><circle cx="64" cy="62" r="8" fill="#7B5C43" stroke="#2F3E44" stroke-width="2.2"/><circle cx="64" cy="62" r="3" fill="#D4A238"/></svg>`}
function cnSceneryHTML(){
  return `<div class="cn-scenery" aria-hidden="true"><div class="cn-lantern left"><i></i><span>灯</span></div><div class="cn-lantern right"><i></i><span>福</span></div><div class="cn-wall"></div></div>`;
}
function stopCannon(){if(cannonRaf)cancelAnimationFrame(cannonRaf);cannonRaf=0;cannon=null}
function updateCannonHud(){if(!cannon)return;const s=$('#cnScore'),lv=$('#cnLives');if(s)s.textContent=cannon.score;if(lv)lv.innerHTML=heartsHTML(cannon.lives);const pg=$('#cnProgress');if(pg)pg.textContent=(cannon.completed+cannon.missed.length)+'/'+cannon.deck.length;const fl=$('#cnFill');if(fl)fl.style.width=(cannon.deck.length?((cannon.completed+cannon.missed.length)/cannon.deck.length*100):0)+'%'}
function unlockCannon(){cannon.locked=null;cannon.typed='';document.querySelectorAll('#cnField .cn-slot.cur').forEach(s=>s.classList.remove('cur'));const b=$('#cnBarrel');if(b)b.setAttribute('transform','rotate(0 44 52)')}
function shakeCannonField(){const f=$('#cnField');if(!f)return;f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake')}
function shakeCannonWord(w){if(!w||!w.node)return;const inner=w.node.querySelector('.cn-inner');if(!inner)return;inner.classList.remove('shake');void inner.offsetWidth;inner.classList.add('shake')}
function spawnCannonWord(W){const l=lessons[activeLesson];if(cannon.di>=cannon.deck.length)return true;const idx=cannon.deck[cannon.di];const v=l.vocab[idx],py=normPinyin(v.pinyin);if(!py){cannon.di++;return true}const f=$('#cnField');if(!f)return false;const node=document.createElement('div');node.className='cn-word';node.innerHTML=`<div class="cn-inner"><div class="cn-han">${esc(v.word)}</div><div class="cn-slots">${[...py].map(()=>'<span class="cn-slot"></span>').join('')}</div></div>`;f.appendChild(node);const tw=node.offsetWidth,minX=8,maxX=Math.max(minX,W-tw-8);let bx=minX,clean=false;for(let t=0;t<14;t++){const x=minX+Math.random()*Math.max(0,maxX-minX);let ok=true;for(const o of cannon.words){const ow=o.w||0;if(x<o.x+ow+10&&o.x<x+tw+10){ok=false;break}}if(ok){bx=x;clean=true;break}}if(!clean){node.remove();return false}cannon.di++;const w={idx,word:v.word,py,x:bx,w:tw,y:-84,node,slotNodes:node.querySelectorAll('.cn-slot'),done:false};if(w.slotNodes[0])w.slotNodes[0].classList.add('cur');cannon.words.push(w);return true}
function fireCannonBullet(w){const f=$('#cnField');if(!f)return;sfx('shoot');const fr=f.getBoundingClientRect(),cr=w.node.getBoundingClientRect();const tx=cr.left-fr.left+cr.width/2,ty=cr.top-fr.top+cr.height/2;const px=fr.width/2,py=fr.height-38;const dx=tx-px,dy=ty-py,d=Math.hypot(dx,dy)||1;const mx=px+dx/d*54,my=py+dy/d*54;const node=document.createElement('div');node.className='cn-bullet';node.style.transform=`translate(${mx}px,${my}px)`;f.appendChild(node);cannon.bullets.push({x:mx,y:my,target:w,node})}
function burstCannon(x,y,big){const f=$('#cnField');if(!f)return;const cols=['#D4A238','#2E7D6B','#546E7A','#8CC5BA','#B88A36'];const n=big?18:4;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=big?60+Math.random()*150:40+Math.random()*60;const node=document.createElement('div');node.className='cn-part';node.style.background=cols[i%cols.length];node.style.transform=`translate(${x}px,${y}px)`;f.appendChild(node);cannon.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:big?650+Math.random()*250:300,node})}}
function floatCannon(x,y,txt){const f=$('#cnField');if(!f)return;const el=document.createElement('div');el.className='cn-float';el.textContent=txt;el.style.left=x+'px';el.style.top=y+'px';f.appendChild(el);setTimeout(()=>el.remove(),950)}
function explodeCannonWord(w){const f=$('#cnField');if(!f)return;markStreak();if((w.errs||0)>=2)srsRecord(w.idx,'pinyin','wrong',w);(cannon.correctSet=cannon.correctSet||new Set()).add(w.idx);sfx('pop');const fr=f.getBoundingClientRect(),cr=w.node.getBoundingClientRect();const cx=cr.left-fr.left+cr.width/2,cy=cr.top-fr.top+cr.height/2;burstCannon(cx,cy,true);floatCannon(cx,Math.max(8,cy-10),'+10');cannon.score+=10;cannon.completed++;cannon.words.splice(cannon.words.indexOf(w),1);cannon.bullets.filter(b=>b.target===w).forEach(b=>b.node.remove());cannon.bullets=cannon.bullets.filter(b=>b.target!==w);w.node.remove();if(cannon.locked===w)unlockCannon();updateCannonHud();checkCannonWin()}
function loseCannonWord(w){const f=$('#cnField');sfx('buzz');cannon.words.splice(cannon.words.indexOf(w),1);cannon.bullets.filter(b=>b.target===w).forEach(b=>b.node.remove());cannon.bullets=cannon.bullets.filter(b=>b.target!==w);if(w.node)w.node.remove();if(cannon.locked===w)unlockCannon();if(cannon.dying||cannon.over)return;const v=lessons[activeLesson].vocab[w.idx];if(!cannon.missed.includes(w.idx))cannon.missed.push(w.idx);if(!w.usrCancel)srsRecord(w.idx,'pinyin','missed',w);cannon.lives--;updateCannonHud();const fl=$('#cnFlash');if(fl){fl.innerHTML=`<div class="cn-flash-han">${esc(v.word)}</div><div class="cn-flash-py">${esc(v.pinyin)}</div><div class="cn-flash-vi">${esc(v.meaning)}</div>`;fl.hidden=false;cannon.flashT=1700}if(cannon.lives<=0){cannon.dying=true;const g=cannon;setTimeout(()=>{if(cannon===g)cannonOver(false)},1750)}checkCannonWin()}
function checkCannonWin(){if(!cannon||cannon.dying||cannon.over)return;if(cannon.di>=cannon.deck.length&&cannon.words.length===0&&cannon.lives>0)cannonOver(true)}
function cannonOver(win){if(!cannon)return;if(typeof Streak!=="undefined"&&cannon.correctSet)Streak.noteGame(cannon.correctSet.size);if(window.LB&&cannon.correctSet)LB.award('game','game-cannon',cannon.correctSet.size,cannon.correctSet.size+(cannon.missed?cannon.missed.length:0));sfx(win?'win':'lose');cannon.over=true;if(cannonRaf)cancelAnimationFrame(cannonRaf);cannonRaf=0;const g=cannon,l=lessons[activeLesson];const missedHtml=g.missed.length?`<div class="game-missed"><h4>Từ bạn đã để rơi mất — ôn lại ngay nhé</h4><div class="game-missed-list">${g.missed.map(i=>{const v=l.vocab[i];return `<div class="game-missed-item"><img src="${vocabPhoto(i)}" alt=""><div><div class="han">${esc(v.word)}</div><div class="pinyin">${esc(v.pinyin)}</div><div>${esc(v.meaning)}</div></div></div>`}).join('')}</div></div>`:'<p class="game-perfect">'+(win?'Bắn hạ toàn bộ từ của bài — pháo bắn quá chuẩn!':'Ván này bạn không để rơi mất từ nào — pháo bắn quá chuẩn!')+'</p>';guessPanel.innerHTML=`<div class="dictation-shell"><div class="score-card"><span class="level-badge">${win?'Thắng rồi — bắn hết cả bài!':'Kết thúc ván'}</span><h3>Pháo Đài Pinyin · Bài ${l.num}</h3><div class="score">${g.score} điểm</div><p>Bắn hạ: <strong>${win?g.completed+'/'+g.deck.length:g.completed} từ</strong></p>${missedHtml}${srsCtaHTML()}<button class="action game-play" id="cnRestart">Chơi lại</button><button class="game-other" data-gallery-back>Chọn game khác</button></div></div>`;cannon=null}
function updateCannonAim(){if(!cannon||!cannon.locked)return;const f=$('#cnField'),b=$('#cnBarrel');if(!f||!b)return;const fr=f.getBoundingClientRect(),cr=cannon.locked.node.getBoundingClientRect();const tx=cr.left-fr.left+cr.width/2,ty=cr.top-fr.top+cr.height/2;const px=fr.width/2,py=fr.height-38;let deg=Math.atan2(tx-px,-(ty-py))*180/Math.PI;deg=Math.max(-72,Math.min(72,deg));b.setAttribute('transform',`rotate(${deg.toFixed(1)} 44 52)`)}
function cannonInput(ch){if(!cannon||cannon.over||cannon.paused||cannon.dying||cannon.counting)return;if(cannon.locked&&cannon.locked.done){unlockCannon()}if(!cannon.locked){const cands=cannon.words.filter(w=>!w.done&&w.py[0]===ch);if(!cands.length){shakeCannonField();return}cands.sort((a,b)=>b.y-a.y);cannon.locked=cands[0];cannon.typed=''}const w=cannon.locked,exp=w.py[cannon.typed.length];if(ch!==exp){w.errs=(w.errs||0)+1;shakeCannonWord(w);return}cannon.typed+=ch;const sn=w.slotNodes[cannon.typed.length-1];if(sn){sn.textContent=ch;sn.classList.add('done')}document.querySelectorAll('#cnField .cn-slot.cur').forEach(s=>s.classList.remove('cur'));const nx=w.slotNodes[cannon.typed.length];if(nx)nx.classList.add('cur');if(cannon.typed.length===w.py.length)w.done=true;fireCannonBullet(w)}
function cannonLoop(now){if(!cannon)return;cannonRaf=requestAnimationFrame(cannonLoop);const dt=Math.min(60,now-(cannon.last||now));cannon.last=now;if(cannon.paused)return;if(cannon.counting)return;const f=$('#cnField');if(!f)return;const W=f.clientWidth,H=f.clientHeight;if(!cannon.over&&!cannon.dying){cannon.spawnT-=dt;if(cannon.spawnT<=0&&cannon.words.length<3&&cannon.di<cannon.deck.length){cannon.spawnT=spawnCannonWord(W)?2400:600}const speed=(H/15)*(1+Math.min(0.4,0.02*cannon.completed));for(const w of [...cannon.words]){w.y+=speed*dt/1000;w.node.style.transform=`translate(${w.x}px,${w.y}px)`;if(w.y>H-8)loseCannonWord(w)}for(const b of [...cannon.bullets]){if(!cannon)break;const t=b.target;if(!t||!cannon.words.includes(t)){b.node.remove();const bi=cannon.bullets.indexOf(b);if(bi>=0)cannon.bullets.splice(bi,1);continue}const fr=f.getBoundingClientRect(),cr=t.node.getBoundingClientRect();const tx=cr.left-fr.left+cr.width/2,ty=cr.top-fr.top+cr.height/2;const dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy);const step=760*dt/1000;if(d<=Math.max(step,20)){b.node.remove();const bi=cannon.bullets.indexOf(b);if(bi>=0)cannon.bullets.splice(bi,1);if(t.done)explodeCannonWord(t);else burstCannon(tx,ty,false)}else{b.x+=dx/d*step;b.y+=dy/d*step;b.node.style.transform=`translate(${b.x}px,${b.y}px)`}}}if(!cannon)return;for(const p of [...cannon.parts]){p.life-=dt;p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=320*dt/1000;if(p.life<=0){p.node.remove();cannon.parts.splice(cannon.parts.indexOf(p),1)}else{p.node.style.transform=`translate(${p.x}px,${p.y}px)`;p.node.style.opacity=Math.max(0,p.life/700)}}if(cannon.flashT>0){cannon.flashT-=dt;if(cannon.flashT<=0){const fl=$('#cnFlash');if(fl)fl.hidden=true}}updateCannonAim()}
function startCannon(){stopGame();stopTower();stopTone();stopCannon();const l=lessons[activeLesson];cannon={score:0,lives:3,words:[],bullets:[],parts:[],locked:null,typed:'',spawnT:500,last:0,paused:false,over:false,dying:false,completed:0,missed:[],deck:shuffleArr(l.vocab.map((_,i)=>i).filter(i=>normPinyin(l.vocab[i].pinyin))),di:0,flashT:0,counting:true};const rows=[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['z','x','c','v','b','n','m']];guessPanel.innerHTML=`<div class="dictation-shell"><div class="cn-bar"><div class="cn-top"><div class="cn-stats"><div class="cn-stat"><span class="cn-stat-label">Điểm</span><strong class="cn-stat-value" id="cnScore">0</strong></div><div class="cn-stat"><span class="cn-stat-label">Từ</span><strong class="cn-stat-value" id="cnProgress">0/${cannon.deck.length}</strong></div><div class="cn-stat"><span class="cn-stat-label">Mạng</span><span class="cn-stat-value" id="cnLives" aria-label="Số mạng còn lại">${heartsHTML(3)}</span></div></div><div class="cn-actions"><button class="cn-btn cn-btn-pause" id="cnPause">${ICON_PAUSE}<span>Tạm dừng</span></button><button class="cn-btn cn-btn-icon" id="cnRestart" aria-label="Chơi lại">${ICON_RESTART}</button>${spkBtnHTML()}<button class="cn-btn cn-btn-icon" data-gallery-back aria-label="Chọn game">${ICON_GRID}</button></div></div><div class="cn-track"><div class="cn-fill" id="cnFill" style="width:0%"></div></div></div><div class="cn-field" id="cnField">${cnSceneryHTML()}<div class="cn-flash" id="cnFlash" hidden></div><div class="cn-count" id="cnCount" hidden></div><div class="cn-cannon">${cannonSVG()}</div><div class="game-veil" id="cnVeil" hidden><p>Đã tạm dừng</p><button class="action" id="cnResume">Chơi tiếp</button><button class="game-quit" data-gallery-back>Dừng hẳn</button></div></div><div class="cn-keys">${rows.map(r=>`<div class="cn-row">${r.map(k=>`<button class="cn-key" data-cn-key="${k}">${k}</button>`).join('')}</div>`).join('')}<div class="cn-row"><button class="cn-key cn-key-wide" id="cnCancel">Hủy khóa</button></div></div><p class="game-note">Gõ phím chữ (máy tính) hoặc chạm phím bên dưới (điện thoại) để bắn · Esc / Hủy khóa: bỏ khóa mục tiêu.</p></div>`;cannonRaf=requestAnimationFrame(cannonLoop);const g=cannon;const setCount=n=>{const el=$('#cnCount');if(!el||cannon!==g)return;el.hidden=false;el.textContent=n;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')};setCount('3');sfx('tick');setTimeout(()=>{setCount('2');sfx('tick')},300);setTimeout(()=>{const el=$('#cnCount');if(!el||cannon!==g)return;setCount('1');sfx('go');const f=$('#cnField');if(f)spawnCannonWord(f.clientWidth);g.spawnT=2400;g.counting=false},600);setTimeout(()=>{const el=$('#cnCount');if(el)el.hidden=true},900)}

function stopTone(){toneG=null}
function renderTone(){const tp=document.getElementById('tonePanel');if(!tp)return;if(activeTab!=='tone'){stopTone();return}startTone()}
function updateToneHud(){if(!toneG)return;const s=$('#tnScore'),lv=$('#tnLives'),p=$('#tnProgress');if(s)s.textContent=toneG.score;if(lv)lv.innerHTML=heartsHTML(toneG.lives);if(p)p.textContent=Math.min(toneG.answered+1,toneG.total)+'/'+toneG.total;const fl=$('#tnFill');if(fl)fl.style.width=(toneG.answered/toneG.total*100)+'%'}
function nextToneRound(){if(!toneG)return;if(toneG.answered>=toneG.total){toneOver();return}const l=lessons[activeLesson];const pool=l.vocab.map((v,i)=>i).filter(i=>/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(l.vocab[i].pinyin));const box=$('#tnBox');if(!box)return;if(!pool.length){box.innerHTML=`<p class="game-note">Bài này chưa có từ phù hợp để luyện thanh điệu.</p><button class="game-other" data-tab="practice">Chọn dạng luyện tập khác</button>`;return}const idx=pool[Math.floor(Math.random()*pool.length)];const v=l.vocab[idx];const opts=shuffleArr([v.pinyin,...toneVariants(v.pinyin,3)]);toneG.round={idx,opts,done:false};box.innerHTML=`<div class="tn-card"><span class="level-badge">Nghe và chọn thanh điệu</span><div class="tn-guide-pills" aria-hidden="true"><span>ˉ Thanh 1</span><span>ˊ Thanh 2</span><span>ˇ Thanh 3</span><span>ˋ Thanh 4</span></div><div class="tn-medallion"><div class="tn-han">${esc(v.word)}</div><div class="tn-base">${esc(stripTones(v.pinyin))}</div></div><button class="tn-listen" id="tnListen">🔊 Nghe lại phát âm</button><div class="tn-opts">${opts.map((o,k)=>`<button class="tn-opt" data-tone-answer="${k}"><span class="ans-num">${k+1}</span><span>${esc(o)}</span></button>`).join('')}</div><p class="tn-msg" id="tnMsg"></p></div>`;speak(v.word)}
function toneAnswer(k){if(!toneG||!toneG.round||toneG.round.done||toneG.over)return;markStreak();const r=toneG.round,l=lessons[activeLesson],v=l.vocab[r.idx];r.done=true;const picked=r.opts[k],ok=picked===v.pinyin;if(ok)(toneG.correctSet=toneG.correctSet||new Set()).add(r.idx);sfx(ok?'ding':'buzz');toneG.answered++;document.querySelectorAll('[data-tone-answer]').forEach((b,i)=>{b.disabled=true;if(r.opts[i]===v.pinyin)b.classList.add('right');if(i===k&&!ok)b.classList.add('wrong')});const msg=$('#tnMsg');if(ok){toneG.score+=10;toneG.streak++;toneG.correct++;if(msg)msg.innerHTML=`Đúng rồi! <strong>${esc(v.pinyin)}</strong> · ${esc(v.meaning)}`}else{toneG.lives--;toneG.streak=0;if(!toneG.missed.includes(r.idx))toneG.missed.push(r.idx);srsRecord(r.idx,'tone','wrong',r);if(msg)msg.innerHTML=`Chưa đúng. Đáp án là <strong>${esc(v.pinyin)}</strong> · ${esc(v.meaning)}`}updateToneHud();const g=toneG;setTimeout(()=>{if(toneG!==g||g.over)return;if(g.lives<=0)toneOver();else nextToneRound()},ok?900:1500)}
function toneOver(){if(!toneG)return;if(typeof Streak!=="undefined"&&toneG.correctSet)Streak.noteGame(toneG.correctSet.size);if(window.LB&&toneG.correctSet)LB.award('game','game-tone',toneG.correctSet.size,toneG.correctSet.size+(toneG.missed?toneG.missed.length:0));toneG.over=true;const g=toneG,l=lessons[activeLesson];sfx(g.lives>0?'win':'lose');const missedHtml=g.missed.length?`<div class="game-missed"><h4>Từ bạn đã chọn sai thanh, ôn lại ngay nhé</h4><div class="game-missed-list">${g.missed.map(i=>{const v=l.vocab[i];return `<div class="game-missed-item"><img src="${vocabPhoto(i)}" alt=""><div><div class="han">${esc(v.word)}</div><div class="pinyin">${esc(v.pinyin)}</div><div>${esc(v.meaning)}</div></div></div>`}).join('')}</div></div>`:'<p class="game-perfect">Ván này bạn không sai thanh nào, tai nghe chuẩn quá!</p>';const tp=document.getElementById('tonePanel')||guessPanel;tp.innerHTML=`<button class="back-to-zone" data-tab="practice">\u2190 Tất cả dạng luyện tập</button><div class="dictation-shell"><div class="score-card"><span class="level-badge">Kết thúc ván</span><h3>Luyện Thanh Điệu · Bài ${l.num}</h3><div class="score">${g.score} điểm</div><p>Chọn đúng: <strong>${g.correct}/${g.total} từ</strong></p>${missedHtml}${srsCtaHTML()}<button class="action game-play" id="tnRestart">Luyện lại</button><button class="game-other" data-tab="practice">Chọn dạng luyện tập khác</button></div></div>`;toneG=null}
function startTone(){stopGame();stopTower();stopCannon();stopKaraoke();stopTone();const l=lessons[activeLesson];toneG={score:0,lives:3,streak:0,correct:0,missed:[],round:null,over:false,total:10,answered:0};const tp=document.getElementById('tonePanel')||guessPanel;tp.innerHTML=`<button class="back-to-zone" data-tab="practice">\u2190 Tất cả dạng luyện tập</button><div class="dictation-shell"><div class="cn-bar"><div class="cn-top"><div class="cn-stats"><div class="cn-stat"><span class="cn-stat-label">Điểm</span><strong class="cn-stat-value" id="tnScore">0</strong></div><div class="cn-stat"><span class="cn-stat-label">Câu</span><strong class="cn-stat-value" id="tnProgress">1/10</strong></div><div class="cn-stat"><span class="cn-stat-label">Mạng</span><span class="cn-stat-value" id="tnLives" aria-label="Số mạng còn lại">${heartsHTML(3)}</span></div></div><div class="cn-actions"><button class="cn-btn cn-btn-icon" id="tnRestart" aria-label="Luyện lại">${ICON_RESTART}</button>${spkBtnHTML()}<button class="cn-btn cn-btn-icon" data-tab="practice" aria-label="Chọn dạng luyện tập">${ICON_GRID}</button></div></div><div class="cn-track"><div class="cn-fill" id="tnFill" style="width:0%"></div></div></div><div id="tnBox"></div></div>`;nextToneRound()}

let karaoke=null;
const KK_SYLS=(()=>{const ini=['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w',''];const fin=['uang','iong','iang','ueng','iao','ian','uan','üan','ang','eng','ing','ong','uai','uei','ai','ei','ao','ou','an','en','in','un','ün','er','ia','ie','ua','uo','üe','iu','ui','ve','ue','a','o','e','i','u','ü','v'];const s=new Set(['hm','m','n','ng','r']);for(const a of ini)for(const b of fin)s.add(a+b);return s})();
function kkBasePy(s){return stripTones(String(s||'')).toLowerCase()}
function kkDpSplit(p){const n=p.length,memo={};function solve(i){if(i===n)return[];if(i in memo)return memo[i];for(let len=Math.min(7,n-i);len>=1;len--){const sub=p.slice(i,i+len),b=kkBasePy(sub);if(KK_SYLS.has(b)){const rest=solve(i+len);if(rest!==null)return(memo[i]=[sub,...rest])}}return(memo[i]=null)}return solve(0)||[p]}
function kkSplitLinePy(py){const words=String(py||'').trim().split(/\s+/),out=[];for(const w of words){const cl=w.replace(/[^a-zA-Z0-9āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ']/g,'');if(!cl)continue;for(const pt of cl.split("'").filter(Boolean))out.push(...kkDpSplit(pt))}return out}
function kkSampleSrc(num,sceneIdx){const tracks=vocabTracksData();const list=tracks?tracks[num]:null;if(!list||!list[2*sceneIdx])return null;return audioBaseForLevel()+list[2*sceneIdx]}
function stopKaraoke(){if(!karaoke)return;if(karaoke.raf)cancelAnimationFrame(karaoke.raf);karaoke.raf=0;if(karaoke.rec){try{karaoke.rec.onend=null;karaoke.rec.onresult=null;karaoke.rec.onerror=null;karaoke.rec.stop()}catch(e){}}const a=document.getElementById('kkSampleAudio');if(a){try{a.pause();a.currentTime=0}catch(e){}}karaoke=null}
function kkBuildState(sceneIdx,speed){const l=lessons[activeLesson],scenes=(curSceneData()&&curSceneData()[l.num])||[];const sIdx=Math.max(0,Math.min(scenes.length-1,sceneIdx||0)),sc=scenes[sIdx];const spd=speed||'normal';const msPerChar=spd==='slow'?540:spd==='fast'?250:370;const minLineMs=spd==='slow'?2800:spd==='fast'?1600:2100;const chars=[],lineMeta=[];if(sc&&sc.lines){sc.lines.forEach((ln,li)=>{const han=String(ln[1]||''),syls=kkSplitLinePy(ln[2]||'');let si=0,cStart=chars.length;for(const ch of han){if(/[\u3400-\u9FFF]/.test(ch)){chars.push({ch,norm:normalizeChinese(ch),lineIdx:li,py:syls[si++]||'',done:false})}}const cEnd=chars.length,cnt=Math.max(1,cEnd-cStart);lineMeta.push({speaker:ln[0],han,py:ln[2]||'',vi:ln[3]||'',cStart,cEnd,dur:Math.max(minLineMs,cnt*msPerChar)})})}return{sceneIdx:sIdx,scenes,sc,speed:spd,running:false,paused:false,over:false,lineIdx:0,lineCursor:lineMeta[0]?lineMeta[0].cStart:0,consumedFinal:0,readPos:0,lastSpeechAt:0,endGraceStart:0,lineElapsed:0,lastTick:0,startTime:0,elapsedMs:0,curY:null,chars,lineMeta,matchedCount:0,finalText:'',interimText:'',rec:null,raf:0}}
function kkLineRubyHTML(li){if(!karaoke||!karaoke.lineMeta[li])return '';const m=karaoke.lineMeta[li];let ci=m.cStart,out='';for(const ch of m.han){if(/[\u3400-\u9FFF]/.test(ch)&&ci<m.cEnd){const cObj=karaoke.chars[ci];out+=`<ruby class="kk-char${cObj&&cObj.done?' done':''}" data-kk-char="${ci}">${esc(ch)}<rt>${esc(cObj?cObj.py:'')}</rt></ruby>`;ci++}else out+=`<span class="kk-punct">${esc(ch)}</span>`}return out}
function startKaraoke(sceneIdx,speed){stopGame();stopTower();stopCannon();stopTone();const prevSpd=speed||(karaoke&&karaoke.speed)||'normal';const prevSc=(typeof sceneIdx==='number')?sceneIdx:((karaoke&&karaoke.sceneIdx)||0);stopKaraoke();karaoke=kkBuildState(prevSc,prevSpd);kkRenderView()}
function kkLineDistClass(idx,activeIdx){const d=Math.abs(idx-activeIdx);if(d===0)return ' active';if(d===1)return ' near';if(d===2)return ' mid';return ' far'}
function kkRenderView(){if(!karaoke)return;const l=lessons[activeLesson],k=karaoke,sampleSrc=kkSampleSrc(l.num,k.sceneIdx);const totalC=k.chars.length,totalL=k.lineMeta.length;guessPanel.innerHTML=`<div class="dictation-shell kk-shell"><div class="cn-bar"><div class="cn-top"><div class="cn-stats"><div class="cn-stat"><span class="cn-stat-label">Đã khớp</span><strong class="cn-stat-value" id="kkMatched">${k.matchedCount}/${totalC}</strong></div><div class="cn-stat"><span class="cn-stat-label">Câu</span><strong class="cn-stat-value" id="kkLineProg">${totalL?1:0}/${totalL}</strong></div><div class="cn-stat"><span class="cn-stat-label">Tỉ lệ</span><strong class="cn-stat-value" id="kkPct">0%</strong></div></div><div class="cn-actions"><button class="cn-btn cn-btn-icon" id="kkRestart" aria-label="Đọc lại">${ICON_RESTART}</button>${spkBtnHTML()}<button class="cn-btn cn-btn-icon" data-gallery-back aria-label="Chọn game">${ICON_GRID}</button></div></div><div class="cn-track"><div class="cn-fill" id="kkFill" style="width:0%"></div></div></div><div class="kk-controls"><div class="scene-tabs kk-scene-tabs" role="tablist" aria-label="Chọn đoạn hội thoại">${k.scenes.map((s,idx)=>`<button type="button" class="scene-tab${idx===k.sceneIdx?' active':''}" data-kk-scene="${idx}">${esc(s.label)}</button>`).join('')}</div><div class="kk-bar-row"><div class="kk-speeds" role="group" aria-label="Tốc độ chạy chữ"><span class="kk-speed-lbl">Tốc độ:</span>${[['slow','Chậm'],['normal','Vừa'],['fast','Nhanh']].map(([id,lbl])=>`<button type="button" class="kk-speed-btn${k.speed===id?' active':''}" data-kk-speed="${id}">${lbl}</button>`).join('')}</div><div class="kk-main-btns">${sampleSrc?`<button type="button" class="kk-sample-btn" id="kkSampleBtn">Nghe mẫu</button><audio class="orig-audio" id="kkSampleAudio" preload="metadata" src="${sampleSrc}" hidden></audio>`:''}<button type="button" class="kk-pause-btn" id="kkPauseBtn" hidden>Tạm dừng</button><button type="button" class="action kk-start-btn" id="kkStartBtn">Bắt đầu đọc</button></div></div></div><p class="kk-notice" id="kkNotice" hidden></p><div class="kk-calc" id="kkCalc" hidden><span class="kk-calc-spin" aria-hidden="true"></span>Đang tính điểm…</div><div class="kk-stage" id="kkStage"><div class="kk-read-band" aria-hidden="true"><span class="kk-band-tag">VẠCH ĐỌC</span><div class="kk-band-progress"><i id="kkBandFill" style="width:0%"></i></div></div><div class="kk-track" id="kkTrack">${k.lineMeta.map((m,li)=>`<div class="kk-line${kkLineDistClass(li,0)}" data-kk-line="${li}"><div class="kk-speaker">${esc(m.speaker)}</div><div class="kk-han">${kkLineRubyHTML(li)}</div><div class="kk-vi">${esc(m.vi)}</div></div>`).join('')}</div></div></div>`;const aud=document.getElementById('kkSampleAudio');if(aud){aud.addEventListener('ended',()=>{const b=document.getElementById('kkSampleBtn');if(b)b.textContent='Nghe mẫu'})}requestAnimationFrame(()=>kkPositionTrack(true))}
function kkToggleSample(){const aud=document.getElementById('kkSampleAudio'),btn=document.getElementById('kkSampleBtn');if(!aud||!btn)return;if(aud.paused){stopAllOrigAudio(false);aud.play().then(()=>{btn.textContent='Dừng nghe mẫu'}).catch(()=>{})}else{aud.pause();btn.textContent='Nghe mẫu'}}
function kkPositionTrack(instant){if(!karaoke)return;const stage=document.getElementById('kkStage'),track=document.getElementById('kkTrack');if(!stage||!track)return;const k=karaoke,activeEl=track.querySelector(`.kk-line[data-kk-line="${k.lineIdx}"]`);if(!activeEl)return;const stageCenter=stage.clientHeight*0.5;const curCenter=activeEl.offsetTop+activeEl.offsetHeight*0.5;let targetCenter=curCenter;const curM=k.lineMeta[k.lineIdx];if(curM&&k.lineIdx<k.lineMeta.length-1){const nextEl=track.querySelector(`.kk-line[data-kk-line="${k.lineIdx+1}"]`);if(nextEl){const nextCenter=nextEl.offsetTop+nextEl.offsetHeight*0.5;const p=Math.max(0,Math.min(1,k.lineElapsed/curM.dur));const glide=p<0.72?(p/0.72)*0.18:0.18+0.82*(0.5-0.5*Math.cos(Math.PI*((p-0.72)/0.28)));targetCenter=curCenter+(nextCenter-curCenter)*glide}}const targetY=stageCenter-targetCenter;if(instant||k.curY===null)k.curY=targetY;else k.curY+=(targetY-k.curY)*0.28;track.style.transform=`translate3d(0,${k.curY.toFixed(1)}px,0)`}
function kkUpdateHud(){if(!karaoke)return;const k=karaoke,totalC=k.chars.length,totalL=k.lineMeta.length;const mEl=$('#kkMatched'),lEl=$('#kkLineProg'),pEl=$('#kkPct'),fEl=$('#kkFill'),bEl=$('#kkBandFill');if(mEl)mEl.textContent=k.matchedCount+'/'+totalC;if(lEl)lEl.textContent=Math.min(k.lineIdx+1,totalL)+'/'+totalL;const pct=totalC?Math.round(k.matchedCount/totalC*100):0;if(pEl)pEl.textContent=pct+'%';const curM=k.lineMeta[k.lineIdx];const frac=curM?Math.min(1,k.lineElapsed/curM.dur):0;if(bEl)bEl.style.width=(frac*100).toFixed(1)+'%';if(fEl){const overall=totalL?Math.min(100,((k.lineIdx+frac)/totalL)*100):0;fEl.style.width=overall.toFixed(1)+'%'}}
function kkMarkChar(k,ci){if(!k.chars[ci]||k.chars[ci].done)return;k.chars[ci].done=true;k.matchedCount++;const node=document.querySelector(`[data-kk-char="${ci}"]`);if(node){node.classList.add('done');node.classList.remove('missed')}}
function kkLineChars(k,li){const m=k.lineMeta[li];if(!m)return[];const out=[];for(let ci=m.cStart;ci<m.cEnd;ci++){if(k.chars[ci]&&k.chars[ci].lineIdx===li)out.push(ci)}return out}
function kkLineDone(k,li){const m=k.lineMeta[li];if(!m)return true;for(let ci=m.cStart;ci<m.cEnd;ci++){const c=k.chars[ci];if(c&&c.lineIdx===li&&!c.done)return false}return true}
function kkMarkMissedLine(k,li){const m=k.lineMeta[li];if(!m)return;for(let ci=m.cStart;ci<m.cEnd;ci++){const c=k.chars[ci];if(c&&c.lineIdx===li&&!c.done){const node=document.querySelector(`[data-kk-char="${ci}"]`);if(node)node.classList.add('missed')}}}
function kkClearPreview(k){if(k.previewSet){k.previewSet.forEach(ci=>{const node=document.querySelector(`[data-kk-char="${ci}"]`);if(node)node.classList.remove('preview')});k.previewSet.clear()}}
function kkScanFrom(k,spoken,fromIdx,mark){const idxs=[];for(let ci=fromIdx;ci<k.chars.length;ci++){if(!k.chars[ci].done)idxs.push(ci)}let p=0;const raw=[];for(let si=0;si<spoken.length&&p<idxs.length;si++){const sch=spoken[si];if(!/[\u3400-\u9FFF]/.test(sch))continue;for(let w=0;w<=8&&p+w<idxs.length;w++){const ci=idxs[p+w];if(k.chars[ci].norm===sch){raw.push({si,ci});p=p+w+1;break}}}const kept=[];let seg=[];const flush=()=>{if(seg.length>=2)kept.push(...seg);seg=[]};for(const m of raw){if(seg.length&&(m.si-seg[seg.length-1].si>4||m.ci-seg[seg.length-1].ci>4))flush();seg.push(m)}flush();const indices=kept.map(m=>m.ci);if(mark)indices.forEach(ci=>kkMarkChar(k,ci));const lastUsed=kept.length?kept[kept.length-1].si:-1;const endPos=indices.length?indices[indices.length-1]+1:fromIdx;return{matched:indices.length,lastUsed,indices,endPos}}
function kkAcceptMatch(k,r){if(!r||r.matched<=0)return;if(typeof k.readPos!=='number')k.readPos=0;k.readPos=Math.max(k.readPos,r.endPos);const lastCi=r.indices[r.indices.length-1];const lastLine=k.chars[lastCi]?k.chars[lastCi].lineIdx:k.lineIdx;if(lastLine>k.lineIdx){const from=k.lineIdx;k.lineIdx=lastLine;k.lineElapsed=0;for(let li=from;li<lastLine;li++)kkMarkMissedLine(k,li);kkHighlightLine(k.lineIdx)}}
function kkBestLineProbe(k,spoken,base){let best=null;for(let li=0;li<=k.lineIdx;li++){const m=k.lineMeta[li];if(!m||m.cEnd<=k.readPos)continue;const r=kkScanFrom(k,spoken,m.cStart,false);if(r.matched>=3&&(!best||r.matched>best.r.matched))best={r,li}}return best&&best.r.matched>(base?base.matched:0)?best:null}
function kkPreviewSpeech(k,interim){kkClearPreview(k);if(!k||k.over||!k.running)return;const spoken=normalizeChinese(interim||'');if(!spoken)return;if(typeof k.readPos!=='number')k.readPos=0;const r=kkScanFrom(k,spoken,k.readPos,false);let indices=r.indices;if(r.matched<3){const best=kkBestLineProbe(k,spoken,r);if(best)indices=best.r.indices}if(!k.previewSet)k.previewSet=new Set();indices.forEach(ci=>{const c=k.chars[ci];if(c&&!c.done){k.previewSet.add(ci);const node=document.querySelector('[data-kk-char="'+ci+'"]');if(node)node.classList.add('preview')}})}
function kkProcessSpeech(newFinal){if(!karaoke||karaoke.over)return;const k=karaoke;const spoken=normalizeChinese(newFinal);if(!spoken)return;kkClearPreview(k);if(typeof k.readPos!=='number')k.readPos=0;const probe1=kkScanFrom(k,spoken,k.readPos,false);const best=probe1.matched<3?kkBestLineProbe(k,spoken,probe1):null;if(best){const r2=kkScanFrom(k,spoken,k.lineMeta[best.li].cStart,true);kkAcceptMatch(k,r2)}else{const r1=kkScanFrom(k,spoken,k.readPos,true);kkAcceptMatch(k,r1)}kkUpdateHud();if(k.matchedCount>=k.chars.length&&k.chars.length>0){setTimeout(()=>{if(karaoke===k&&!k.over)finishKaraoke()},350)}}function kkHighlightLine(li){document.querySelectorAll('.kk-line').forEach((el,idx)=>{el.className='kk-line'+kkLineDistClass(idx,li)+(idx<li?' passed':'')});kkPositionTrack(false)}
function kkLoop(now){if(!karaoke||!karaoke.running||karaoke.over)return;const k=karaoke;const dt=Math.min(80,now-(k.lastTick||now));k.lastTick=now;if(!k.paused){k.elapsedMs+=dt;const curM=k.lineMeta[k.lineIdx];if(!curM){finishKaraoke();return}k.lineElapsed+=dt;if(k.lineElapsed>=curM.dur){if(k.lineIdx<k.lineMeta.length-1){kkMarkMissedLine(k,k.lineIdx);kkClearPreview(k);k.lineIdx++;k.lineElapsed=0;k.lineCursor=k.lineMeta[k.lineIdx].cStart;kkHighlightLine(k.lineIdx)}else{if(!k.endGraceStart)k.endGraceStart=now;if(!k.lastSpeechAt||now-k.lastSpeechAt>=2500||now-k.endGraceStart>=6000){kkUpdateHud();finishKaraoke();return}const cEl=$('#kkCalc');if(cEl)cEl.hidden=false}}}kkPositionTrack(false);kkUpdateHud();k.raf=requestAnimationFrame(kkLoop)}
function kkTogglePause(){if(!karaoke||!karaoke.running||karaoke.over)return;karaoke.paused=!karaoke.paused;karaoke.lastTick=performance.now();const pb=document.getElementById('kkPauseBtn');if(pb){pb.textContent=karaoke.paused?'Tiếp tục':'Tạm dừng';pb.classList.toggle('paused',karaoke.paused)}}
function kkBeginReading(){if(!karaoke||karaoke.over)return;const k=karaoke;if(k.running){finishKaraoke();return}const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const notice=document.getElementById('kkNotice');if(!SR){if(notice){notice.textContent='Trình duyệt này chưa hỗ trợ nhận dạng giọng nói, hãy mở bằng Chrome hoặc Edge.';notice.hidden=false}return}if(notice)notice.hidden=true;const aud=document.getElementById('kkSampleAudio');if(aud&&!aud.paused){try{aud.pause()}catch(e){};const sb=document.getElementById('kkSampleBtn');if(sb)sb.textContent='Nghe mẫu'}const rec=new SR();rec.lang='zh-CN';rec.continuous=true;rec.interimResults=true;rec.onresult=ev=>{if(!karaoke||karaoke!==k||k.over)return;let fin='',inter='';for(let i=0;i<ev.results.length;i++){const tr=ev.results[i][0].transcript;if(ev.results[i].isFinal)fin+=tr;else inter+=tr}k.finalText=fin;k.interimText=inter;k.lastSpeechAt=performance.now();kkPreviewSpeech(k,inter);if(fin.length<k.consumedFinal)k.consumedFinal=0;const newFinal=fin.slice(k.consumedFinal);k.consumedFinal=fin.length;if(newFinal)kkProcessSpeech(newFinal)};rec.onerror=ev=>{if(!karaoke||karaoke!==k||k.over)return;if(ev&&ev.error==='not-allowed'){if(notice){notice.textContent='Vui lòng cấp quyền micro cho trình duyệt để bắt đầu đọc.';notice.hidden=false}k.running=false;k.paused=false;if(k.raf)cancelAnimationFrame(k.raf);const btn=document.getElementById('kkStartBtn'),pb=document.getElementById('kkPauseBtn');if(btn)btn.textContent='Bắt đầu đọc';if(pb)pb.hidden=true}};rec.onend=()=>{if(karaoke===k&&k.running&&!k.over){k.consumedFinal=0;try{rec.start()}catch(e){}}};try{rec.start()}catch(e){if(notice){notice.textContent='Không thể khởi động micro, vui lòng thử lại.';notice.hidden=false}return}k.rec=rec;k.running=true;k.paused=false;k.startTime=performance.now();k.lastTick=k.startTime;k.elapsedMs=0;k.lineIdx=0;k.lineElapsed=0;k.lineCursor=k.lineMeta[0]?k.lineMeta[0].cStart:0;k.consumedFinal=0;const btn=document.getElementById('kkStartBtn'),pb=document.getElementById('kkPauseBtn');if(btn)btn.textContent='Hoàn thành đọc';if(pb){pb.hidden=false;pb.textContent='Tạm dừng';pb.classList.remove('paused')}kkHighlightLine(0);kkPositionTrack(true);const shell=document.querySelector('.kk-shell');if(shell&&shell.scrollIntoView){try{shell.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}k.raf=requestAnimationFrame(kkLoop)}
function finishKaraoke(){if(!karaoke||karaoke.over)return;const k=karaoke;k.over=true;k.running=false;k.paused=false;if(k.raf)cancelAnimationFrame(k.raf);k.raf=0;if(k.rec){try{k.rec.onend=null;k.rec.stop()}catch(e){}}const totalC=k.chars.length,matched=k.matchedCount,missed=Math.max(0,totalC-matched);const pct=totalC?Math.round(matched/totalC*100):0;const sec=Math.max(1,Math.round((k.elapsedMs||1000)/1000));const missedChars=k.lineMeta.map((m,li)=>k.chars.filter(c=>c.lineIdx===li&&!c.done).map(c=>c.ch).join('')).filter(Boolean).join(' / ');if(typeof Streak!=="undefined"&&matched>0)Streak.noteGame(matched);if(window.LB&&totalC>0&&matched>0)LB.award('game','game-karaoke',matched,totalC);sfx(pct>=60?'win':'ding');const l=lessons[activeLesson],nextScene=(k.sceneIdx+1)%Math.max(1,k.scenes.length);guessPanel.innerHTML=`<div class="dictation-shell"><div class="score-card"><span class="level-badge">Hoàn thành đoạn hội thoại</span><h3>Karaoke Đọc Đuổi · Bài ${l.num}</h3><div class="score">${pct}%</div><p>Số chữ đọc đúng: <strong>${matched}/${totalC} chữ (${pct}%)</strong> · Số chữ còn sót: <strong>${missed} chữ</strong> · Thời gian đã dùng: <strong>${sec} giây</strong></p>${missed>0?`<p class="kk-missed-list">Chữ còn sót: <strong>${esc(missedChars.slice(0,120))}</strong></p>`:''}${k.finalText?`<p class="kk-missed-list">Máy nghe được: <strong>${esc(k.finalText.slice(0,200))}</strong></p>`:''}<div class="kk-end-actions"><button class="action game-play" id="kkRetryBtn" data-kk-retry="${k.sceneIdx}">Đọc lại</button><button class="action game-play kk-next-btn" id="kkNextSceneBtn" data-kk-next="${nextScene}">Đoạn tiếp theo</button></div><button class="game-other" data-gallery-back>Chọn game khác</button></div></div>`}
document.addEventListener('click',e=>{const _b=e.target.closest?e.target.closest('button'):null;const _id=_b?_b.id:e.target.id;const g=e.target.closest('[data-game]');if(g){const id=g.dataset.game;currentGame=id;if(id==='cannon')startCannon();else if(id==='karaoke')startKaraoke();else if(id==='fall')renderFallIntro();else if(id==='carp')renderTowerStart();pushRoute();return}if(e.target.closest('[data-gallery-back]')||_id==='gameToGallery'){currentGame=null;renderGuess();pushRoute();return}const ksc=e.target.closest('[data-kk-scene]');if(ksc&&karaoke){startKaraoke(+ksc.dataset.kkScene,karaoke.speed);return}const ksp=e.target.closest('[data-kk-speed]');if(ksp&&karaoke){if(!karaoke.running){karaoke.speed=ksp.dataset.kkSpeed;startKaraoke(karaoke.sceneIdx,karaoke.speed)}return}if(_id==='kkSampleBtn'){kkToggleSample();return}if(_id==='kkPauseBtn'){kkTogglePause();return}if(_id==='kkStartBtn'){kkBeginReading();return}if(_id==='kkRestart'&&karaoke){startKaraoke(karaoke.sceneIdx,karaoke.speed);return}const krt=e.target.closest('[data-kk-retry]');if(krt){startKaraoke(+krt.dataset.kkRetry,karaoke?karaoke.speed:'normal');return}const knx=e.target.closest('[data-kk-next]');if(knx){startKaraoke(+knx.dataset.kkNext,karaoke?karaoke.speed:'normal');return}if(_id==='cnPause'&&cannon&&!cannon.over){cannon.paused=true;const veil=$('#cnVeil');if(veil)veil.hidden=false;return}if(_id==='cnResume'&&cannon){cannon.paused=false;const veil=$('#cnVeil');if(veil)veil.hidden=true;return}if(_id==='cnRestart'){startCannon();return}if(_id==='cnCancel'){if(cannon&&cannon.locked)cannon.locked.usrCancel=true;unlockCannon();return}const ck=e.target.closest('[data-cn-key]');if(ck){cannonInput(ck.dataset.cnKey);return}if(_id==='tnListen'&&toneG&&toneG.round){speak(lessons[activeLesson].vocab[toneG.round.idx].word);return}const ta=e.target.closest('[data-tone-answer]');if(ta&&!ta.disabled){toneAnswer(+ta.dataset.toneAnswer);return}if(_id==='tnRestart'){startTone();return}});
document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;if(activeTab==='tone'&&toneG&&toneG.round&&!toneG.round.done&&!toneG.over){const map={'1':0,'2':1,'3':2,'4':3};if(e.key in map){const b=document.querySelector(`[data-tone-answer="${map[e.key]}"]`);if(b&&!b.disabled)toneAnswer(map[e.key])}return}if(activeTab!=='guess')return;if(cannon&&!cannon.over&&!cannon.paused&&!cannon.dying){if(e.key==='Escape'){if(cannon.locked)cannon.locked.usrCancel=true;unlockCannon();return}const ch=e.key.toLowerCase();if(/^[a-z]$/.test(ch))cannonInput(ch);return}});
function syncHaiYingTab(){
  if(!window.HaiYing3D)return;
  const l=lessons[activeLesson];if(!l)return;
  if(activeTab==='guess'){HaiYing3D.setVisible(false);return}
  HaiYing3D.setVisible(true);
  if(activeTab==='vocab'){
    if(isVocabFlow()&&vFocus.on){
      const groups=vocabGroupsCur(),idxs=groups[vFocus.g]||[],v=l.vocab[idxs[vFocus.w]];
      if(v)HaiYing3D.say(`Từ ${vFocus.w+1}/${idxs.length} · ${esc(v.word)}`,`<strong>${esc(v.word)}</strong> (${esc(v.pinyin)}) — <strong>“${esc(v.meaning)}”</strong>. Bấm <strong>Tập viết</strong> để mình chấm nét chữ cho nhé!`,'teach');
    }else{
      HaiYing3D.say(`Bài ${l.num} · ${esc(l.theme)}`,`Bài này có <strong>${l.vocab.length} từ vựng</strong> và <strong>${l.grammar.length} ngữ pháp</strong>. Chạm vào mình bất kỳ lúc nào để xem mẹo học nhé!`,'wave',11000,true);
    }
  }else if(activeTab==='grammar'){
    HaiYing3D.say(`Ngữ pháp · Bài ${l.num}`,`Hãy đọc kỹ <strong>công thức</strong>, ví dụ minh họa và các <strong>lỗi thường gặp</strong> bên dưới để nắm chắc ngữ pháp trọng tâm bài ${l.num} nhé!`,'teach');
  }else if(activeTab==='analysis'){
    HaiYing3D.say(`Bài khóa · Bài ${l.num}`,`Hãy <strong>nghe băng gốc</strong> rồi chọn thử <strong>các câu trắc nghiệm ở dưới</strong> trước nhé!`,'teach');
  }else if(activeTab==='practice'||activeTab==='quiz'||activeTab==='fill'||activeTab==='tone'){
    HaiYing3D.say(`Luyện tập · Bài ${l.num}`,`Cùng kiểm tra trí nhớ với Flashcard, Nghe chép, Điền từ và Luyện thanh điệu nào! 加油!`,'cheer');
  }
}
function grUpdateSummary(){const l=lessons[activeLesson],sum=$('#grLessonSummary');if(!l||!sum)return;const st=grLessonStats(l);sum.querySelector('.gr-sum-top').innerHTML=`<span>✍️ Đặt câu theo ngữ pháp · <strong>${st.done}/${st.total}</strong> câu</span><span class="gr-sum-pts">+${st.pts}/${st.maxPts} điểm</span>`;const bar=sum.querySelector('.gr-sum-bar i');if(bar)bar.style.width=Math.round(st.done/st.total*100)+'%'}
function grRefreshBox(gi){const l=lessons[activeLesson],box=document.querySelector(`[data-gr-box="${gi}"]`);if(!l||!box)return;box.outerHTML=grPracticeBoxHTML(l.num,gi);grUpdateSummary()}
function submitGrammarPractice(gi,pi){const l=lessons[activeLesson];if(!l)return;const ps=grPromptsFor(l.num,gi),it=ps[pi];if(!it)return;const inp=document.querySelector(`[data-gr-input="${gi}:${pi}"]`),fb=document.getElementById(`grFb-${gi}-${pi}`);if(!inp||!fb)return;const store=grLoadStore(),k=grKey(l.num,gi,pi);if(store[k])return;const typed=inp.value.trim();if(!typed){inp.focus();return}const check=grCheckDetail(typed,it);if(!check.ok){sfx('buzz');fb.innerHTML=`<div class="gr-pr-res err"><strong>Chưa đạt:</strong> ${esc(check.msg)}</div>`;inp.focus();return}store[k]={typed,ts:Date.now()};grSaveStore(store);markStreak();sfx('ding');lbAwardOnce('grammar','grammar:'+k,1,1);grRefreshBox(gi);const nowBoth=!!(store[grKey(l.num,gi,0)]&&store[grKey(l.num,gi,1)]);if(window.HaiYing3D&&typeof HaiYing3D.say==='function'){if(nowBoth)HaiYing3D.say('Hoàn hảo! +20 điểm',`Bạn đã hoàn thành cả 2 câu cho <strong>${esc(l.grammar[gi].title)}</strong> (+40đ)!`,'cheer',6000);else HaiYing3D.say('Đúng rồi! +20 điểm',`Bạn vừa nhận <strong>+20 điểm</strong>! Thử tiếp <strong>Câu ${pi===0?2:1}</strong> ngay bên cạnh nhé!`,'cheer',5000)}}
function renderAll(){renderNav();renderHead();renderVocab();renderAnalysis();renderGrammar();renderQuiz();renderFill();renderTone();renderGuess();renderPracticeZone();renderWorkbook();document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==activeTab+'Panel');const mainTab=activeTab==='guess'?'games':['vocab','analysis','grammar'].includes(activeTab)?activeTab:'practice';document.querySelectorAll('.maintab').forEach(t=>t.classList.toggle('active',t.dataset.main===mainTab));document.querySelectorAll('.bottom-nav button').forEach(t=>t.classList.toggle('active',t.dataset.main===mainTab));const pt=document.getElementById('practiceTabs');if(pt)pt.style.display=mainTab==='practice'?'':'none';document.querySelectorAll('.practicetab[data-tab]').forEach(t=>t.classList.toggle('active',t.dataset.tab===activeTab));const tb2=document.querySelector('.toolbar');if(tb2)tb2.style.display=activeTab==='vocab'?'':'none';const fo=document.getElementById('flashOpen');if(fo)fo.style.display='none';syncHaiYingTab();}
document.addEventListener('click',e=>{const grt=e.target.closest('[data-gr-tab]');if(grt){const[gi,pi]=grt.dataset.grTab.split(':').map(Number);const l=lessons[activeLesson];if(l){grActiveTab[l.num+':'+gi]=pi;grRefreshBox(gi)}return}const grh=e.target.closest('[data-gr-hint]');if(grh){const[gi,pi]=grh.dataset.grHint.split(':');const hb=document.getElementById(`grHint-${gi}-${pi}`);if(hb)hb.hidden=!hb.hidden;return}const grc=e.target.closest('[data-gr-chip]');if(grc){const k=grc.dataset.grChip;const inp=document.querySelector(`[data-gr-input="${k}"]`);if(inp&&!inp.disabled){inp.value=(inp.value||'')+grc.dataset.word;inp.focus();const[gi,pi]=k.split(':');const fb=document.getElementById(`grFb-${gi}-${pi}`);if(fb&&fb.querySelector('.err'))fb.innerHTML=''}return}const grx=e.target.closest('[data-gr-clear]');if(grx){const k=grx.dataset.grClear;const inp=document.querySelector(`[data-gr-input="${k}"]`);if(inp&&!inp.disabled){inp.value='';inp.focus()}return}const grs=e.target.closest('[data-gr-submit]');if(grs){const[gi,pi]=grs.dataset.grSubmit.split(':').map(Number);submitGrammarPractice(gi,pi);return}const lb=e.target.closest('[data-lesson]');if(lb)selectLesson(+lb.dataset.lesson);const mn=e.target.closest('[data-main]');if(mn){const mm=mn.dataset.main;activeTab=mm==='practice'?'practice':mm==='games'?'guess':mm;currentGame=null;renderAll();pushRoute();window.scrollTo({top:document.querySelector('.layout').offsetTop-10,behavior:'smooth'})}const fcm=e.target.closest('[data-flashcard]');if(fcm){const fo=document.getElementById('flashOpen');if(fo)fo.click()}const tab=e.target.closest('[data-tab]');if(tab){activeTab=tab.dataset.tab;if(['quiz','fill','tone','guess'].includes(activeTab))lastPractice=activeTab;currentGame=null;renderAll();pushRoute();window.scrollTo({top:document.querySelector('.layout').offsetTop-10,behavior:'smooth'})}const sp=e.target.closest('[data-speak]');if(sp){const v=lessons[activeLesson].vocab[+sp.dataset.speak];speak(v.word+'。'+v.example)}const rd=e.target.closest('[data-read]');if(rd)speak(rd.dataset.read,rd.dataset.speaker);if(e.target.id==='listenSentence')playDictation(.82);if(e.target.id==='listenSlow')playDictation(.62);if(e.target.id==='checkDictation')checkDictation(false);if(e.target.id==='showAnswer')checkDictation(true);if(e.target.id==='dictationPrev'&&dictationIndex>0){dictationIndex--;renderDictationQuestion()}if(e.target.id==='dictationNext'){if(!dictationResults[dictationIndex])checkDictation(true);dictationIndex++;renderDictationQuestion()}if(e.target.id==='dictationRedo')resetDictation();const fc=e.target.closest('[data-fill-chip]');if(fc){const inp=$('#fillInput');if(inp&&!inp.disabled){inp.value=fc.dataset.fillChip;inp.focus()}return}if(e.target.id==='fillListen')playFill();if(e.target.id==='fillCheck')checkFill(false);if(e.target.id==='fillShow')checkFill(true);if(e.target.id==='fillPrev'&&fillIndex>0){fillIndex--;renderFillQuestion()}if(e.target.id==='fillNext'){fillIndex++;renderFillQuestion()}if(e.target.id==='fillRedo')resetFill();if(e.target.id==='guessHintBtn'){guessHint=true;renderGuessQuestion()}if(e.target.id==='guessSpeak'){const gv=lessons[activeLesson].vocab[guessIndex];if(gv)speak(gv.word)}if(e.target.id==='guessCheck')checkGuess(false);if(e.target.id==='guessShow')checkGuess(true);if(e.target.id==='guessPrev'&&guessIndex>0){guessIndex--;guessHint=false;renderGuessQuestion()}if(e.target.id==='guessNext'){if(!guessResults[guessIndex])checkGuess(true);guessIndex++;guessHint=false;renderGuessQuestion()}if(e.target.id==='guessRedo')resetGuess()});
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.grInput){const[gi,pi]=e.target.dataset.grInput.split(':');const fb=document.getElementById(`grFb-${gi}-${pi}`);if(fb&&fb.querySelector('.err'))fb.innerHTML=''}if(e.target.id==='dictationInput'&&!dictationResults[dictationIndex]){const f=$('#dictationFeedback');if(f)f.innerHTML=''}if(e.target.id==='fillInput'&&!fillResults[fillIndex]){const f=$('#fillFeedback');if(f)f.innerHTML=''}});document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.grInput){e.preventDefault();const[gi,pi]=e.target.dataset.grInput.split(':').map(Number);submitGrammarPractice(gi,pi)}if(e.key==='Enter'&&e.target.id==='dictationInput'){e.preventDefault();checkDictation(false)}if(e.key==='Enter'&&e.target.id==='fillInput'){e.preventDefault();checkFill(false)}if(e.key==='Enter'&&e.target.id==='guessInput'){e.preventDefault();checkGuess(false)}});pinyinToggle.addEventListener('click',()=>{pinyinVisible=!pinyinVisible;document.body.classList.toggle('hide-pinyin',!pinyinVisible);pinyinToggle.textContent=pinyinVisible?'拼音 · Ẩn':'拼音 · Hiện'});flashOpen.addEventListener('click',()=>{flashDeck=[...lessons[activeLesson].vocab];flashIndex=0;markStreak();renderFlash();flashOverlay.classList.add('open');pushRoute()});flashClose.addEventListener('click',()=>{strokeRun++;flashOverlay.classList.remove('open');pushRoute()});flashOverlay.addEventListener('click',e=>{if(e.target===flashOverlay){flashOverlay.classList.remove('open');pushRoute()}});flashCard.addEventListener('click',()=>{markStreak();flashCard.classList.toggle('flipped')});flashCard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();markStreak();flashCard.classList.toggle('flipped')}});flashPrev.addEventListener('click',()=>{markStreak();flashIndex=(flashIndex-1+flashDeck.length)%flashDeck.length;renderFlash()});flashNext.addEventListener('click',()=>{markStreak();flashIndex=(flashIndex+1)%flashDeck.length;renderFlash()});flashSpeak.addEventListener('click',()=>{const v=flashDeck[flashIndex];speak(v.word+'。'+v.example)});flashShuffle.addEventListener('click',()=>{flashDeck.sort(()=>Math.random()-.5);flashIndex=0;renderFlash()});
async function playStrokes(){if(strokePlaying){strokeSkip=true;return;}const v=flashDeck[flashIndex];if(!v)return;markStreak();const run=++strokeRun;strokePlaying=true;strokeSkip=false;flashCard.classList.remove('flipped');const front=flashCard.querySelector('.flash-front .word');if(!front){strokePlaying=false;return;}front.innerHTML='<div class="flash-stroke" id="strokeStage"></div>';const stage=front.querySelector('#strokeStage');const chars=[...v.word];const size=chars.length===1?180:chars.length===2?130:100;flashStroke.textContent='Hiện luôn ⏩';try{if(typeof HanziWriter==='undefined')throw new Error('no-lib');for(const ch of chars){if(run!==strokeRun)return;const el=document.createElement('div');stage.appendChild(el);const w=HanziWriter.create(el,ch,{width:size,height:size,padding:6,strokeColor:'#15334d',outlineColor:'rgba(21,51,77,.18)',delayBetweenStrokes:80,strokeAnimationSpeed:2});if(strokeSkip){w.showCharacter();}else{await w.animateCharacter();}}}catch(err){if(run===strokeRun){front.textContent=v.word;flashStroke.textContent='Bút thuận (lỗi mạng)';setTimeout(()=>{if(run===strokeRun)flashStroke.textContent='Bút thuận'},3000);}}finally{strokePlaying=false;if(run===strokeRun){flashStroke.disabled=false;flashStroke.textContent='Bút thuận';}}}
flashStroke.addEventListener('click',playStrokes);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&flashcardOpen()&&!kbVeilOpen()){flashOverlay.classList.remove('open');pushRoute()}});
/* Bang tro giup phim tat (mo bang phim ?) */
const kbVeil=document.createElement('div');
kbVeil.className='kb-veil';kbVeil.id='kbVeil';
kbVeil.innerHTML='<div class="kb-card" role="dialog" aria-label="Phím tắt"><button class="kb-close" id="kbClose" aria-label="Đóng">×</button><h3>Phím tắt</h3><p class="kb-sub">Chỉ hoạt động trên máy tính, và không chạy khi đang gõ trong ô nhập.</p><div class="kb-rows"><div class="kb-row"><kbd>P</kbd><span>Ẩn / hiện pinyin</span></div><div class="kb-row"><kbd>← →</kbd><span>Từ trước / từ sau, câu trước / câu sau</span></div><div class="kb-row"><kbd>R</kbd><span>Nghe lại từ hoặc câu đang mở</span></div><div class="kb-row"><kbd>M</kbd><span>Tắt / bật tiếng game</span></div><div class="kb-row"><kbd>Esc</kbd><span>Đóng bảng này, đóng flashcard, về danh sách từ</span></div><div class="kb-row"><kbd>?</kbd><span>Mở / đóng bảng này</span></div></div><p class="kb-note">Phím tắt không thay nút bấm, mọi thao tác vẫn dùng chuột và chạm như cũ.</p></div>';
document.body.appendChild(kbVeil);
function kbVeilOpen(){return kbVeil.classList.contains('open')}
function openKbHelp(){kbVeil.classList.add('open')}
function closeKbHelp(){kbVeil.classList.remove('open')}
function toggleKbHelp(){kbVeil.classList.toggle('open')}
document.getElementById('kbClose').addEventListener('click',closeKbHelp);
kbVeil.addEventListener('click',e=>{if(e.target===kbVeil)closeKbHelp()});
const _kbPt=document.getElementById('pinyinToggle');if(_kbPt)_kbPt.title='Ẩn/hiện pinyin (phím P)';
/* Phim tat chung: P pinyin, mui ten qua lai, R nghe lai, M tat tieng, Esc quay lai, ? mo bang nay */
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const t=e.target;
  if(t&&t.closest&&t.closest('input,textarea,select,audio,video,[contenteditable="true"]'))return;
  const k=e.key;
  const clickId=id=>{const b=document.getElementById(id);if(b&&!b.disabled){b.click();return true}return false};
  if(k==='Escape'){
    if(kbVeilOpen()){closeKbHelp();return}
    if(flashcardOpen())return;
    if(vFocus&&vFocus.on){if(!clickId('vBack'))exitFocus();return}
    return;
  }
  if(k==='?'){toggleKbHelp();return}
  if(cannon&&!cannon.over&&!cannon.paused&&!cannon.dying)return;
  if(k==='p'||k==='P'){const b=document.getElementById('pinyinToggle');if(b)b.click();return}
  if(k==='m'||k==='M'){const b=document.querySelector('[data-sfx-toggle]');if(b)b.click();return}
  if(k==='r'||k==='R'){
    if(activeTab==='vocab'&&vFocus&&vFocus.on){const s=document.querySelector('.v-focus-wrap .speak');if(s){s.click();return}}
    if(activeTab==='analysis'){const rd=document.querySelector('#sceneStep [data-read]');if(rd){rd.click();return}}
    if(activeTab==='quiz'){clickId('listenSentence');return}
    if(activeTab==='fill'){clickId('fillListen');return}
    return;
  }
  if(k==='ArrowLeft'||k==='ArrowRight'){
    const d=k==='ArrowLeft'?-1:1;
    if(flashcardOpen()){clickId(d<0?'flashPrev':'flashNext');return}
    /* man hoc tung tu da co handler mui ten rieng (moveFocus), khong lam lai */
    if(activeTab==='analysis'){clickId(d<0?'scenePrev':'sceneNext');return}
    if(activeTab==='quiz'){clickId(d<0?'dictationPrev':'dictationNext');return}
    if(activeTab==='fill'){clickId(d<0?'fillPrev':'fillNext');return}
  }
});const backTop=document.getElementById('backTop');if(backTop){window.addEventListener('scroll',()=>{backTop.classList.toggle('show',window.scrollY>600)},{passive:true});backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}bootLevel();
