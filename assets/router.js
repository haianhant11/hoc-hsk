/* router.js — pure URL routing for the static lesson pages (no framework).
   Route shape: /{course}/{lessonNum}/{tab}[/{activity|game}]
   course: hsk3 | hsk4-thuong | hsk4-ha
   tab: tu-vung | bai-khoa | ngu-phap | luyen-tap | tro-choi
   luyen-tap activities: flashcard | nghe-chep | dien-tu
   tro-choi games: phao-dai-pinyin | tu-roi | ca-chep-hoa-rong | luyen-thanh-dieu
   Bare course path (/{course}) is the course entry alias (first lesson + vocab).
   Loaded BEFORE engine.js; engine.js calls Router.parse / Router.url. */
const Router = (function(){
  'use strict';
  const TAB_SLUGS = {vocab:'tu-vung', analysis:'bai-khoa', grammar:'ngu-phap', practice:'luyen-tap', guess:'tro-choi'};
  const SLUG_TABS = {'tu-vung':'vocab', 'bai-khoa':'analysis', 'ngu-phap':'grammar', 'luyen-tap':'practice', 'tro-choi':'guess'};
  const SLUG_ACTS = {'flashcard':'flashcard', 'nghe-chep':'quiz', 'dien-tu':'fill'};
  const GAME_SLUGS = {cannon:'phao-dai-pinyin', fall:'tu-roi', carp:'ca-chep-hoa-rong', tone:'luyen-thanh-dieu'};
  const SLUG_GAMES = {'phao-dai-pinyin':'cannon', 'tu-roi':'fall', 'ca-chep-hoa-rong':'carp', 'luyen-thanh-dieu':'tone'};
  function cleanParts(path){
    let p = String(path || '').replace(/\/+/g, '/');
    if(p.length > 1) p = p.replace(/\/$/, '');
    return p.split('/').filter(Boolean).map(s => s.replace(/\.html$/i, ''));
  }
  function parse(path, pageCourse){
    const parts = cleanParts(path);
    if(!parts.length) return null;
    if(parts[0] !== pageCourse) return null;
    if(parts.length === 1) return {bare:true, course:parts[0]};
    const n = parseInt(parts[1], 10);
    const lessonNum = isNaN(n) ? null : n;
    const tab = parts[2];
    let view = 'tu-vung';
    if(tab === 'luyen-tap'){
      view = 'luyen-tap';
      if(parts[3] && SLUG_ACTS[parts[3]]) view = 'luyen-tap/' + parts[3];
    }else if(tab === 'tro-choi'){
      view = 'tro-choi';
      if(parts[3] && SLUG_GAMES[parts[3]]) view = 'tro-choi/' + parts[3];
    }else if(tab && SLUG_TABS[tab]){
      view = tab;
    }
    return {bare:false, course:parts[0], lessonNum:lessonNum, view:view};
  }
  function url(course, lessonNum, view){ return '/' + course + '/' + lessonNum + '/' + view; }
  return {parse:parse, url:url, TAB_SLUGS:TAB_SLUGS, SLUG_TABS:SLUG_TABS, SLUG_ACTS:SLUG_ACTS, GAME_SLUGS:GAME_SLUGS, SLUG_GAMES:SLUG_GAMES};
})();
