/* =====================================================================
   한국어 / English — 시민용 화면(index.html, map.html) 번역
   - 한국어 문장이 그대로 열쇠. 영어 화면에서만 바꿔 보여줌
   - 데이터베이스에 저장되는 값(벌집, 현재위치, 접수 …)은 항상 한국어 그대로
   - 언어: 주소 ?lang=en|ko > 이전에 고른 언어 > 휴대폰 언어 (한국어가 아니면 영어)
   ===================================================================== */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ko') { try { localStorage.setItem('hr.lang', q); } catch {} return q; }
  try { const s = localStorage.getItem('hr.lang'); if (s === 'en' || s === 'ko') return s; } catch {}
  return /^ko/i.test(navigator.language || 'ko') ? 'ko' : 'en';
})();

const EN = {
  /* 공통·머리줄 */
  '← 뒤로': '← Back', '뒤로': 'Back', '말벌 신고': 'Hornet Report', '말벌 발생 지도': 'Hornet sightings map',
  '내 신고 보기': 'My reports', '우리 지역 말벌 활동': 'Hornet activity near me', '처음으로': 'Home',
  '신고하기': 'Report', '불러오는 중…': 'Loading…', '저장소:': 'Storage:', '이 기기 (시연)': 'this device (demo)', '저장소 연결 중…': 'Connecting…',

  /* 첫 화면 */
  '벌에 쏘였어요': 'I have been stung', '벌이 공격하고 있어요': 'Bees or hornets are attacking',
  '119 연결 · 응급처치 · 내 위치 안내': 'Call 119 · First aid · Show my location',
  '벌집이나 말벌을 봤어요': 'I saw a nest or hornets',
  '사진으로 신고하면 2일 안에 전문가가 확인합니다': 'Send a photo — an expert checks it within 2 days',
  '벌집은 직접 없애지 마세요. 사람이 다니는 곳의 벌집은 119에 제거를 요청할 수 있습니다.':
    'Never remove a nest yourself. Call 119 to remove nests near homes, schools or paths.',
  '이번 주 말벌 활동': 'Hornet activity this week', '기상 기준': 'weather-based', '지수 지도': 'See map',
  '관심': 'Low', '주의': 'Caution', '경계': 'Warning', '심각': 'Severe',
  '말벌 활동이 적은 시기입니다.': 'Hornets are not very active now.',
  '말벌 활동이 시작됐습니다. 벌초·산행 때 주의하세요.': 'Hornets are active. Take care outdoors and on hikes.',
  '말벌 활동이 활발합니다. 벌초·산행 전 주변을 살피세요.': 'Hornets are very active. Check for nests before mowing or hiking.',
  '말벌 활동이 매우 활발합니다. 산·들 작업을 조심하세요.': 'Hornet activity is at its peak. Be very careful in fields and forests.',

  /* 응급 */
  '📞 119 전화하기': '📞 Call 119',
  '119에 이렇게 불러 주세요': 'Read this to 119, or show this screen to a Korean speaker',
  '119는 영어 등 외국어 통역을 연결해 줍니다. 영어나 모국어로 말하세요.': '119 can connect an interpreter. Speak English or your own language.',
  '내 위치를 찾는 중…': 'Finding your location…', '위치 다시 찾기': 'Find again', '위치 복사': 'Copy location',
  '침착하게, 지금 할 일은 세 가지입니다': 'Stay calm. Do these three things now',
  '벌에게서 벗어나세요': 'Get away from the bees',
  '머리를 감싸고 몸을 낮춰 20m 이상 빠르게 벗어나세요. 손으로 쫓지 마세요.': 'Cover your head, keep low and move at least 20 m away quickly. Do not swat at them.',
  '벌침을 긁어서 빼세요': 'Scrape out the stinger',
  '신용카드처럼 납작한 것으로 피부를 밀어 빼고, 쏘인 곳을 씻은 뒤 얼음찜질하세요. 손이나 핀셋으로 집지 마세요.':
    'Push it out with something flat like a credit card, wash the area and apply ice. Do not pinch it with fingers or tweezers.',
  '이런 증상이면 바로 119': 'Call 119 at once if you have',
  '어지러움, 두드러기, 숨이 참, 입술·얼굴 부기. 몇 분 사이에도 나빠질 수 있습니다.':
    'dizziness, hives, trouble breathing, or swollen lips or face. It can get worse within minutes.',
  '가까운 응급실 찾기': 'Find a nearby ER',
  '안정된 뒤에 기록을 남겨 주세요 (선택)': 'When you are safe, please record it (optional)',
  '어디서 쏘였는지 모이면 위험 지역을 미리 알릴 수 있습니다. 30초면 됩니다.': 'Knowing where stings happen helps us warn others. It takes 30 seconds.',
  '쏘임 기록 남기기': 'Record the sting',
  '이 기기는 위치를 알려주지 않습니다. 주변 건물이나 도로 이름을 119에 알려 주세요.': 'This device cannot share its location. Tell 119 the names of nearby buildings or roads.',
  '위도 {lat}, 경도 {lon} (오차 약 {acc}m)': 'Lat {lat}, Lon {lon} (±{acc} m)',
  '주소 확인 중…': 'Looking up the address…',
  '주소를 찾지 못했습니다. 아래 위도·경도를 불러 주세요.': 'Address not found. Read out the latitude and longitude below.',
  '위치 권한이 꺼져 있습니다. 주변 건물·도로·산 이름을 119에 알려 주세요.': 'Location access is off. Tell 119 the names of nearby buildings, roads or mountains.',
  '위치를 찾지 못했습니다. 주변 건물·도로·산 이름을 119에 알려 주세요.': 'Could not find your location. Tell 119 the names of nearby buildings, roads or mountains.',
  '아직 위치를 찾지 못했습니다.': 'Location not found yet.',
  '{addr} (위도 {lat}, 경도 {lon})': '{addr} (lat {lat}, lon {lon})',
  '위치를 복사했습니다. 문자로 보낼 수 있습니다.': 'Location copied. You can paste it into a text message.',

  /* 신고 양식 */
  '무엇을 봤나요?': 'What did you see?', '벌집': 'Nest', '말벌': 'Hornets',
  '가까이 가지 말고, 줌으로 멀리서 찍어 주세요. 벌집을 건드리면 벌이 한꺼번에 공격합니다.':
    'Do not go close. Zoom in from a distance. If a nest is disturbed, the whole colony attacks.',
  '쏘임 기록': 'Sting record', '쏘인 사람 수': 'People stung', '명': 'people',
  '가장 심한 증상': 'Worst symptom', '쏘인 곳만 붓고 아픔': 'Pain and swelling at the sting only',
  '온몸 증상': 'Whole-body symptoms', '병원 치료': 'Needed hospital care',
  '무엇을 하다가 쏘였나요?': 'What were you doing?',
  '벌초·성묘': 'Grave mowing / visit', '등산·산행': 'Hiking', '농작업': 'Farm work', '양봉 작업': 'Beekeeping',
  '집 주변': 'Around home', '기타': 'Other',
  '벌집이 어디에 있나요?': 'Where is the nest?', '벌집이 어디 있었나요? (알면)': 'Where was the nest? (if known)',
  '땅속': 'In the ground', '나무 구멍·속': 'In a tree hollow', '나무 가지': 'On a branch',
  '처마·외벽': 'Under eaves / on a wall', '벽·지붕 속': 'Inside a wall / roof', '모름·기타': 'Unknown / other',
  '어디 근처인가요?': 'What is it near?',
  '집·건물': 'Home / building', '학교·어린이집': 'School / daycare', '길·공원': 'Road / park', '산·들': 'Forest / field', '양봉장': 'Apiary',
  '사람이 다니는 곳의 벌집은 지금 119에 제거를 요청할 수 있습니다. 이 신고도 먼저 확인합니다.':
    'You can call 119 now to remove nests where people walk. We will check this report first.',
  '사진': 'Photos', '사진 (선택)': 'Photos (optional)',
  '사진이 있으면 종까지 확인할 수 있습니다. 최대 3장.': 'With a photo we can identify the species. Up to 3.',
  '벌이나 벌집 사진이 있으면 올려 주세요. 없어도 됩니다.': 'Add a photo of the insect or nest if you have one. Not required.',
  '사진 고르기 또는 촬영': 'Choose or take a photo',
  '어디였나요?': 'Where was it?', '어디서 쏘였나요?': 'Where were you stung?',
  '벌집이나 말벌이 있던 곳을 정해 주세요.': 'Mark where the nest or hornets were.',
  '사진 찍은 곳이 아니라 벌집이나 말벌이 있던 곳을 정해 주세요.': 'Mark where the nest or hornets were, not where you took the photo.',
  '쏘인 곳을 정해 주세요.': 'Mark where you were stung.',
  '사진 위치': 'Photo location', '현재 위치': 'My location', '지도에서': 'On the map',
  '주소나 마을 이름으로 찾기': 'Search by address or place name', '찾기': 'Search',
  '예: 김제 백련리': 'e.g. Jeonju City Hall',
  '언제였나요?': 'When?', '언제 봤나요?': 'When did you see it?', '언제 쏘였나요?': 'When were you stung?',
  '메모 (선택)': 'Notes (optional)', '예: 처마 밑, 축구공 크기, 벌이 많이 드나듦': 'e.g. under the eaves, football-sized, many hornets flying in and out',
  '보내신 위치와 사진은 말벌 확인과 방제에만 쓰입니다. 공개 지도에는 담당자가 확인한 내용만 약 1km 단위로 표시되고, 정확한 주소와 사진은 공개하지 않습니다. 이름·연락처는 받지 않습니다.':
    'Your location and photos are used only to verify and control hornets. The public map shows checked reports at about 1 km resolution; exact addresses and photos are never published. We do not collect names or contact details.',
  '기록 보내기': 'Send record',
  '사진은 최대 3장까지 올릴 수 있습니다.': 'You can add up to 3 photos.',
  '사진 촬영일로 채웠습니다. 다르면 고쳐 주세요.': 'Filled from the photo date. Change it if needed.',
  '사진에 남은 위치를 넣었습니다. 다른 곳이면 지도에서 옮겨 주세요.': 'Used the location saved in the photo. Move it on the map if wrong.',
  '기록 없음': 'none', '원거리': 'far', '사진 정보를 읽는 중…': 'Reading photo info…', '열 수 없음': 'cannot open',
  '촬영일시': 'Taken', '촬영위치': 'Location', '기종': 'Device', '환산초점': 'Focal (35mm)', '원본': 'Original',
  '사진 빼기': 'Remove photo',
  '사진 찍은 곳과 지금 위치가 약 {km}km 떨어져 있습니다. 나중에 올리는 사진이면 "사진 위치"가 맞습니다.':
    'The photo was taken about {km} km from where you are now. For an older photo, use "Photo location".',
  '오차 약 {m}m': '±{m} m',
  '지도를 눌러 위치를 정하세요.': 'Tap the map to set the location.',
  '이 기기는 위치를 알려주지 않습니다.': 'This device cannot share its location.',
  '현재 위치를 찾는 중…': 'Finding your location…',
  '위치 권한이 꺼져 있습니다. 지도나 주소로 정해 주세요.': 'Location access is off. Use the map or address search.',
  '현재 위치를 찾지 못했습니다.': 'Could not find your location.',
  '찾는 중…': 'Searching…',
  '결과가 없습니다. 읍·면·리 이름이나 건물 이름으로 다시 찾거나 지도에서 정해 주세요.': 'No results. Try a town or building name, or set it on the map.',
  '벌집인지 말벌인지 골라 주세요.': 'Please choose Nest or Hornets.',
  '사진 정보를 읽는 중입니다. 잠시 후 다시 눌러 주세요.': 'Still reading the photo. Try again in a moment.',
  '위치를 정해 주세요.': 'Please set the location.', '보내는 중…': 'Sending…',
  '보내지 못했습니다: ': 'Could not send: ',

  /* 완료·내 신고 */
  '접수되었습니다': 'Report received', '이 지역 말벌 활동 보기': 'Hornet activity in this area',
  '기록해 주셔서 감사합니다. 몸 상태가 나빠지면 바로 119에 전화하세요.': 'Thank you. If you feel worse, call 119 immediately.',
  '사람이나 꿀벌 가까이 있는 신고라 먼저 확인합니다. ': 'This is near people or bees, so we will check it first. ',
  '전문가가 2일 안에 확인하고, 결과는 "내 신고"에서 볼 수 있습니다. 벌집은 직접 없애지 마세요.':
    'An expert will check it within 2 days. See the result in "My reports". Never remove a nest yourself.',
  '내 신고': 'My reports', '이 기기에서 보낸 신고입니다. 전문가 확인은 2일 단위로 이루어집니다.': 'Reports sent from this device. Experts review every 2 days.',
  '확인 대기': 'Waiting', '확인됨': 'Checked', '반려': 'Not accepted', '둥지 {s}': 'nest {s}',
  '아직 보낸 신고가 없습니다.': 'No reports yet.', '불러오지 못했습니다: ': 'Could not load: ',
  '쏘임': 'Sting', '말벌 목격': 'Hornet sighting', '벌집 발견': 'Nest found',

  /* 저장값 → 표시 (데이터베이스 값은 한국어 그대로) */
  '현재위치': 'my location', '사진위치': 'photo location', '지도선택': 'set on map', '주소검색': 'address search',
  '활동중': 'active', '제거됨': 'removed', '사라짐': 'gone', '자진 소멸': 'died out', '미기재': 'not recorded',
  '소방': 'Fire dept.', '지자체': 'Local government', '방제업체': 'Pest control',
  '말벌 아님': 'not a hornet', '대상 없음': 'nothing visible', '사진 불량': 'poor photo', '중복': 'duplicate', '위치 오류': 'wrong location', '부적절': 'inappropriate',
  '판별불가': 'species unknown',

  /* 발생 지도 */
  '말벌 발생 현황': 'Hornet sightings', '기간': 'Period', '최근 7일': '7 days', '최근 30일': '30 days', '올해': 'This year', '보기': 'Show',
  '활동 중인 벌집 (기간과 관계없이 모두)': 'Active nests (all, any date)', '처리된 벌집 (제거·소멸)': 'Resolved nests (removed / gone)',
  '현황': 'Overview', '처리 결과': 'Results', '확인된 종': 'Confirmed species',
  '지역별 (활동 벌집·쏘임 많은 순)': 'By area (most active nests and stings)', '시군구': 'City / county', '시도': 'Province',
  '말벌 활동 지수 (기상 기반)': 'Hornet activity index (weather-based)',
  '날씨로 계산한 말벌 활동 위험과 앞으로 2주 흐름입니다.': 'Hornet activity risk calculated from the weather, with a 2-week outlook.',
  '우리 지역 (시민용)': 'My area', '전국 (담당자용)': 'Nationwide (staff)',
  '벌집을 발견하면 직접 없애지 말고 멀리 떨어진 뒤 119에 제거를 요청하세요. 쏘인 뒤 어지럽거나 숨이 차면 바로 119.':
    'If you find a nest, do not remove it — move away and call 119. If you feel dizzy or short of breath after a sting, call 119 at once.',
  '담당자가 사진과 내용을 확인한 신고만 표시합니다 (2일 단위 갱신). 개인 정보 보호를 위해 위치는 약 1km 단위로 표시하며, 정확한 주소는 공개하지 않습니다.':
    'Only reports checked by experts are shown (updated every 2 days). To protect privacy, locations are shown at about 1 km resolution and exact addresses are never published.',
  '활동 중인 벌집': 'Active nest', '✓ 처리된 벌집 ({s})': '✓ Resolved nest ({s})', '종: {s}': 'Species: {s}',
  '발생: {d}': 'Date: {d}', '발견: {d}': 'Found: {d}', '장소: {s}': 'Near: {s}', '쏘인 사람: {n}명': 'People stung: {n}',
  '처리: {d}{h} (발견 후 {n}일)': 'Resolved: {d}{h} ({n} days after report)', '가까이 가지 마세요. 확인 {d}': 'Keep away. Confirmed {d}',
  '활동 중인 벌집 (지금)': 'Active nests (now)', '처리된 벌집 (기간)': 'Resolved nests (period)', '말벌 목격 (기간)': 'Hornet sightings (period)',
  '쏘임 (기간)': 'Stings (period)', '{a}건 · {b}명': '{a} · {b} people',
  '올해 확인된 벌집 <b>{a}</b>곳 중 <b>{b}</b>곳 처리 ({p}%)': '<b>{b}</b> of <b>{a}</b> nests confirmed this year resolved ({p}%)',
  '발견부터 제거까지 평균 <b>{n}</b>일': 'Average <b>{n}</b> days from report to removal', '처리 주체: {s}': 'Handled by: {s}',
  '올해 확인된 벌집이 아직 없습니다.': 'No nests confirmed this year yet.',
  '기간 안에 종까지 확인된 신고가 없습니다.': 'No species confirmed in this period.',
  '지역': 'Area', '활동 벌집': 'Active', '처리': 'Resolved', '지역 미상': 'unknown area',
  '표시할 자료가 없습니다.': 'Nothing to show.', '지도를 불러오지 못했습니다: ': 'Could not load the map: ',
  '담당자 확인 자료 {n}건 · {t} 기준': '{n} checked reports · as of {t}', '자료를 불러오지 못했습니다: ': 'Could not load data: ',
};

/* 종 이름: '말벌'이 신고 종류와 종(Vespa crabro) 두 뜻이라 따로 둠 */
const SPECIES_EN = {
  '등검은말벌': 'Yellow-legged hornet (Vespa velutina)', '장수말벌': 'Northern giant hornet (Vespa mandarinia)',
  '말벌': 'European hornet (Vespa crabro)', '꼬마장수말벌': 'Vespa ducalis', '좀말벌': 'Vespa analis',
  '털보말벌': 'Vespa simillima', '검정말벌': 'Vespa dybowskii', '판별불가': 'species unknown' };
const TS = v => (LANG === 'en' && v && SPECIES_EN[v]) ? SPECIES_EN[v] : v;

function T(ko, vars){
  let s = (LANG === 'en' && EN[ko] != null) ? EN[ko] : ko;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : '');
  return s;
}
const TV = v => (v == null || v === '') ? v : T(v);          // 저장값 표시용

function translateDom(root){
  document.documentElement.lang = LANG;
  if (LANG !== 'en') return;
  const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
  const todo = [];
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement; if (!p || p.closest('script,style,[data-no-i18n]')) continue;
    const t = n.nodeValue.trim(); if (t && EN[t] != null) todo.push([n, t]);
  }
  todo.forEach(([n, t]) => { n.nodeValue = n.nodeValue.replace(t, EN[t]); });
  (root || document).querySelectorAll('[placeholder],[aria-label],[title]').forEach(e => ['placeholder', 'aria-label', 'title'].forEach(a => {
    const v = e.getAttribute(a); if (v && EN[v.trim()] != null) e.setAttribute(a, EN[v.trim()]);
  }));
  if (EN[document.title]) document.title = EN[document.title];
}

/* 머리줄 언어 버튼: 누르면 다른 언어로 다시 열림 */
function langButton(){
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lang-btn'; b.textContent = LANG === 'en' ? '한국어' : 'English';
  b.setAttribute('aria-label', LANG === 'en' ? '한국어로 보기' : 'View in English');
  b.style.cssText = 'border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:.85rem;font-weight:500;padding:6px 10px;border-radius:8px;cursor:pointer;flex:none';
  b.onclick = () => {
    const next = LANG === 'en' ? 'ko' : 'en';
    try { localStorage.setItem('hr.lang', next); } catch {}
    const q = new URLSearchParams(location.search); q.set('lang', next);
    location.href = location.pathname + '?' + q.toString();
  };
  return b;
}
