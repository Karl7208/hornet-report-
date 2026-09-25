/* =====================================================================
   말벌 신고 앱 2판 — 공통 코드 (index.html 신고 화면, review.html 검수 화면이 함께 씀)
   설정 · 도구 · 사진 정보 추출 · 저장소(이 기기 / Supabase) · CSV
   ===================================================================== */
/* =====================================================================
   설정
   ===================================================================== */
const DEFAULTS = {
  mode: 'supabase',            // 'local' | 'supabase'
  supabaseUrl: 'https://wutwfnhtpvxvvgvuwker.supabase.co',
  supabaseAnonKey: 'sb_publishable_OduH1zWwcADFq9H3IwQ2sw_9s9fR7Hv',
  retentionDays: 90,        // 원본 보존 기간
  trashDays: 30,            // 휴지통 보관 기간
  displayMaxPx: 2048,       // 표시용 사본 긴 변
  displayQuality: 0.85,
  appVersion: 'v2.0'
};
const LS = k => { try { return localStorage.getItem('hr.' + k); } catch { return null; } };
const LSset = (k, v) => { try { localStorage.setItem('hr.' + k, v); } catch {} };
const CFG = { ...DEFAULTS };
try { Object.assign(CFG, JSON.parse(LS('cfg') || '{}')); } catch {}
const saveCfg = () => LSset('cfg', JSON.stringify(CFG));

const SPECIES = ['등검은말벌','장수말벌','꼬마장수말벌','좀말벌','털보말벌','검정말벌','말벌','말벌 아님','판별불가'];
const TYPE_COLOR = { '쏘임':'#C62828', '말벌':'#E3A21A', '벌집':'#22463A' };
const TYPE_NAME = { '쏘임':'쏘임', '말벌':'말벌 목격', '벌집':'벌집 발견' };
const PLACES = ['집·건물', '학교·어린이집', '길·공원', '산·들', '양봉장', '기타'];
const PRIORITY_PLACES = ['집·건물', '학교·어린이집', '길·공원', '양봉장'];   // 사람·꿀벌 가까이 → 우선 처리
const INDEX_APP_URL = 'https://karl7208.github.io/hornet-index/';          // 말벌 활동 지수 앱 (공개 후 주소)

/* ── 외부 서비스 키 (둘 다 '공개용' 키: 등록한 도메인에서만 작동) ─────────────
   kakaoJs : 카카오 디벨로퍼스 > 내 애플리케이션 > 앱 키 > JavaScript 키
             (플랫폼 > Web 에 https://karl7208.github.io, http://localhost:8000 등록)
             → 좌표를 정확한 행정구역(시도·시군구·읍면동·리, 법정동코드)과 주소로 변환, 주소 검색
   vworld  : 브이월드(vworld.kr) 인증키 → 배경지도. 비우면 OpenStreetMap
   REST API 키·Admin 키는 절대 넣지 말 것 */
const KEYS = { kakaoJs: '2ec0fbb2acefbe2f5b555a26ab021fe4', vworld: 'FD8DE046-E470-4069-81E6-CCA18CE105A9', vworldLayer: 'white' };

/* =====================================================================
   작은 도구
   ===================================================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const localStamp = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const rand = n => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; const r = new Uint32Array(n); (crypto.getRandomValues? crypto.getRandomValues(r) : r.forEach((_,i)=>r[i]=Math.random()*1e9)); r.forEach(v => s += a[v % a.length]); return s; };
const km = (a, b) => { const R=6371, t=x=>x*Math.PI/180; const dLa=t(b.lat-a.lat), dLo=t(b.lon-a.lon);
  const h=Math.sin(dLa/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
const fmtC = (lat, lon) => `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'), 2600); }
const LIBS = {
  leaflet: { test: () => window.L, js: ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'],
             css: ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'] },
  exifr:   { test: () => window.exifr, js: ['https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js','https://cdnjs.cloudflare.com/ajax/libs/exifr/7.1.3/full.umd.js'] }
};
const _libP = {};
function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('시간 초과')), ms))]); }
function need(name){
  const lib = LIBS[name];
  if (lib.test()) return Promise.resolve();
  if (_libP[name]) return _libP[name];
  _libP[name] = (async () => {
    (lib.css || []).slice(0, 1).forEach(h => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h;
      l.onerror = () => { if (lib.css[1]) { const l2 = document.createElement('link'); l2.rel = 'stylesheet'; l2.href = lib.css[1]; document.head.appendChild(l2); } };
      document.head.appendChild(l); });
    for (const src of lib.js) { try { await withTimeout(loadScript(src), 8000); if (lib.test()) return; } catch {} }
    delete _libP[name];
    throw new Error(name === 'leaflet' ? '지도 기능을 불러오지 못했습니다. 네트워크(기관망 차단 등)를 확인하세요.' : '사진 정보 읽기 기능을 불러오지 못했습니다.');
  })();
  return _libP[name];
}
function loadScript(src){ return new Promise((res, rej) => { const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('스크립트를 불러오지 못했습니다: '+src)); document.head.appendChild(s); }); }
function download(name, text, type){ const b=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000); }
let UID = LS('uid'); if (!UID) { UID = 'U-' + rand(10); LSset('uid', UID); }

/* =====================================================================
   사진 정보 추출 → 표준 필드
   ===================================================================== */
function formatOf(file){
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const t = (file.type || '').toLowerCase();
  if (t.includes('heic') || t.includes('heif') || ext === 'heic' || ext === 'heif') return 'HEIC';
  if (t.includes('png') || ext === 'png') return 'PNG';
  if (t.includes('jpeg') || t.includes('jpg') || ext === 'jpg' || ext === 'jpeg') return 'JPEG';
  if (t.includes('webp') || ext === 'webp') return 'WEBP';
  return (ext || t || '기타').toUpperCase();
}
function cleanRaw(obj){
  // 바이너리·썸네일 제거, 날짜는 현지 시각 문자열로
  if (!obj) return null;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    if (v instanceof Date) out[k] = localStamp(v);
    else if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer) continue;
    else if (Array.isArray(v)) { if (v.length <= 8 && v.every(x => typeof x !== 'object')) out[k] = v; }
    else if (typeof v === 'object') continue;
    else out[k] = v;
  }
  return out;
}
async function readExif(file){
  let raw = null;
  try {
    await need('exifr');
    raw = await exifr.parse(file, { tiff:true, exif:true, gps:true, ifd1:false, interop:false,
      xmp:false, icc:false, iptc:false, jfif:false, ihdr:false, makerNote:false, userComment:false,
      mergeOutput:true, translateValues:true, reviveValues:true });
  } catch (e) { raw = null; }
  const r = raw || {};
  const taken = r.DateTimeOriginal || r.CreateDate || r.ModifyDate || null;
  const lat = typeof r.latitude === 'number' && isFinite(r.latitude) ? r.latitude : null;
  const lon = typeof r.longitude === 'number' && isFinite(r.longitude) ? r.longitude : null;
  const device = [r.Make, r.Model].filter(Boolean).join(' ').trim() || null;
  const f35 = Number(r.FocalLengthIn35mmFormat) || null;
  const fields = {
    has_exif: !!(taken || lat != null || device || f35),
    exif_taken_at: taken instanceof Date ? localStamp(taken) : null,
    exif_lat: lat, exif_lon: lon,
    exif_device: device,
    exif_lens: r.LensModel || null,
    exif_focal_35mm: f35
  };
  return { fields, raw: cleanRaw(raw) };
}
async function decode(blob, fmt){
  try { const bm = await createImageBitmap(blob, { imageOrientation:'from-image' }); return { src: bm, w: bm.width, h: bm.height }; } catch {}
  try { const img = await new Promise((res, rej) => { const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=URL.createObjectURL(blob); });
        return { src: img, w: img.naturalWidth, h: img.naturalHeight }; } catch {}
  if (fmt === 'HEIC') {
    if (!window.heic2any) await loadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
    const jpg = await heic2any({ blob, toType:'image/jpeg', quality:0.92 });
    return decode(Array.isArray(jpg) ? jpg[0] : jpg, 'JPEG');
  }
  throw new Error('이 형식의 사진은 이 브라우저에서 열 수 없습니다.');
}
async function makeDisplay(file, fmt){
  const d = await decode(file, fmt);
  const s = Math.min(1, CFG.displayMaxPx / Math.max(d.w, d.h));
  const c = document.createElement('canvas'); c.width = Math.round(d.w*s); c.height = Math.round(d.h*s);
  c.getContext('2d').drawImage(d.src, 0, 0, c.width, c.height);
  // 캔버스로 다시 그리면 사진 정보(위치 포함)는 사본에 남지 않음
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', CFG.displayQuality));
  return { blob, w: c.width, h: c.height, origW: d.w, origH: d.h };
}
async function sha256(blob){
  if (!crypto.subtle) return null;
  const h = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2,'0')).join('');
}

/* =====================================================================
   저장소: 이 기기(IndexedDB) — 표준 레코드 형식은 Supabase와 동일
   경로 규칙: "<버킷>/<연>/<월>/<media_id>.<확장자>"
   ===================================================================== */
const P = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const LocalStore = {
  name: '이 기기 (시연)',
  async init(){
    this.db = await new Promise((res, rej) => {
      const r = indexedDB.open('hornet-report-demo', 1);
      r.onupgradeneeded = () => { const d = r.result;
        d.createObjectStore('reports', { keyPath:'report_id' });
        d.createObjectStore('media', { keyPath:'media_id' });
        d.createObjectStore('blobs'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  },
  os(n, m='readonly'){ return this.db.transaction(n, m).objectStore(n); },
  async saveReport(report, media, blobs){
    for (const [path, blob] of Object.entries(blobs)) await P(this.os('blobs','readwrite').put(blob, path));
    for (const m of media) await P(this.os('media','readwrite').put(m));
    await P(this.os('reports','readwrite').put(report));
  },
  async listReports(){ const a = await P(this.os('reports').getAll()); return a.sort((x,y) => y.created_at.localeCompare(x.created_at)); },
  async listMedia(id){ const a = await P(this.os('media').getAll()); return a.filter(m => !id || m.report_id === id).sort((x,y)=>x.seq-y.seq); },
  async blobURL(path){ if (!path) return null; const b = await P(this.os('blobs').get(path)); return b ? URL.createObjectURL(b) : null; },
  async updateReport(id, patch){ const r = await P(this.os('reports').get(id)); await P(this.os('reports','readwrite').put({ ...r, ...patch })); },
  async updateMedia(id, patch){ const m = await P(this.os('media').get(id)); await P(this.os('media','readwrite').put({ ...m, ...patch })); },
  async runRetention(){
    const now = new Date(), nowS = now.toISOString(); let trashed = 0, deleted = 0;
    for (const m of await this.listMedia()) {
      let cur = m;
      if (cur.orig_status === '보관' && !cur.keep_original && cur.orig_expires_at && cur.orig_expires_at <= nowS) {
        cur = { ...cur, orig_status:'휴지통', trashed_at: nowS }; trashed++;
      }
      if (cur.orig_status === '휴지통' && !cur.keep_original) {
        const due = new Date(new Date(cur.trashed_at).getTime() + CFG.trashDays*864e5);
        if (due <= now) { await P(this.os('blobs','readwrite').delete(cur.orig_path)); cur = { ...cur, orig_status:'삭제됨' }; deleted++; }
      }
      if (cur !== m) await P(this.os('media','readwrite').put(cur));
    }
    return { trashed, deleted };
  },
  async wipe(){ for (const n of ['reports','media','blobs']) await P(this.os(n,'readwrite').clear()); }
};

/* =====================================================================
   저장소: Supabase (C안) — supabase_schema.sql 적용 후 사용
   ===================================================================== */
const SupaStore = {
  name: 'Supabase',
  async init(){
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) throw new Error('Supabase 주소와 공개 키를 설정에서 넣어 주세요.');
    if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
    this.c = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  },
  split(path){ const i = path.indexOf('/'); return [path.slice(0, i), path.slice(i+1)]; },
  chk({ error }){ if (error) throw new Error(error.message); },
  async saveReport(report, media, blobs){
    for (const [path, blob] of Object.entries(blobs)) {
      const [bucket, key] = this.split(path);
      const up = await this.c.storage.from(bucket).upload(key, blob, { contentType: blob.type || 'application/octet-stream', upsert:false });
      if (up.error && !(String(up.error.statusCode) === '409' || /exist|duplicate/i.test(up.error.message))) throw new Error(up.error.message);
    }
    this.chk(await this.c.from('reports').insert(report));
    if (media.length) this.chk(await this.c.from('media').insert(media));
  },
  async listReports(){ const r = await this.c.from('reports').select('*').order('created_at', { ascending:false }).limit(1000); this.chk(r); return r.data; },
  async listMedia(id){ let q = this.c.from('media').select('*').order('seq'); if (id) q = q.eq('report_id', id); const r = await q; this.chk(r); return r.data; },
  async blobURL(path){ if (!path) return null; const [b, k] = this.split(path); const r = await this.c.storage.from(b).createSignedUrl(k, 3600); return r.error ? null : r.data.signedUrl; },
  async updateReport(id, patch){ this.chk(await this.c.from('reports').update(patch).eq('report_id', id)); },
  async updateMedia(id, patch){ this.chk(await this.c.from('media').update(patch).eq('media_id', id)); },
  async runRetention(){
    const r = await this.c.rpc('apply_retention', { trash_days: CFG.trashDays }); this.chk(r);
    const due = await this.c.from('media').select('media_id,orig_path').eq('orig_status', '삭제대상'); this.chk(due);
    let deleted = 0;
    for (const m of due.data) {
      const [b, k] = this.split(m.orig_path);
      const rm = await this.c.storage.from(b).remove([k]);
      if (!rm.error) { await this.updateMedia(m.media_id, { orig_status:'삭제됨' }); deleted++; }
    }
    return { trashed: r.data ?? 0, deleted };
  },
  async wipe(){ throw new Error('서버 자료는 여기서 지우지 않습니다.'); }
};

let STORE = CFG.mode === 'supabase' ? SupaStore : LocalStore;


/* =====================================================================
   CSV — 엑셀 호환 (저장할 때 UTF-8 BOM, 읽을 때 UTF-8 → 안 되면 EUC-KR)
   ===================================================================== */
function toCSV(rows, cols){
  const q = v => v == null ? '' : /[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  return '\ufeff' + cols.map(c => q(c)).join(',') + '\r\n' + rows.map(r => cols.map(c => q(r[c])).join(',')).join('\r\n');
}
async function readTextFile(file){
  const buf = await file.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf).replace(/^\ufeff/, ''); }
  catch { return new TextDecoder('euc-kr').decode(buf); }          // 엑셀에서 그냥 "CSV"로 저장한 경우
}
function parseCSV(text){
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some(x => x !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur); if (row.some(x => x !== '')) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/* 저장소 보강: 기간·상태 조회, 긴 서명 링크 */
LocalStore.listReportsWhere = async function(fn){ return (await this.listReports()).filter(fn); };
SupaStore.listReportsWhere = async function(fn){ return (await this.listReports()).filter(fn); };
SupaStore.signedURL = async function(path, seconds){
  if (!path) return null; const [b, k] = this.split(path);
  const r = await this.c.storage.from(b).createSignedUrl(k, seconds); return r.error ? null : r.data.signedUrl;
};
LocalStore.signedURL = async function(){ return null; };
SupaStore.insertLog = async function(row){ const r = await this.c.from('review_log').insert(row); return !r.error; };
LocalStore.insertLog = async function(){ return true; };

/* 공개 지도용: 승인된 자료만, 좌표 약 1km 격자 (Supabase는 public_map 뷰, 이 기기 모드는 같은 규칙으로 계산) */
SupaStore.publicMap = async function(){
  const r = await this.c.from('public_map').select('*').limit(10000); this.chk(r); return r.data;
};
LocalStore.publicMap = async function(){
  const y0 = `${new Date().getFullYear()}-01-01`;
  return (await this.listReports()).filter(r => r.status === '승인' && r.species !== '말벌 아님' &&
      (r.seen_date >= y0 || (r.report_type === '벌집' && (r.nest_status || '활동중') === '활동중')))
    .map(r => ({ report_id: r.report_id, report_type: r.report_type, species: r.species,
      nest_status: r.nest_status || (r.report_type === '벌집' ? '활동중' : null), nest_status_at: r.nest_status_at, nest_handler: r.nest_handler,
      seen_date: r.seen_date, confirmed_on: (r.reviewed_at || '').slice(0, 10), place_type: r.place_type, sting_count: r.sting_count,
      sido: r.sido || null, sigungu: r.sigungu || null,
      region: [r.sido, r.sigungu].filter(Boolean).join(' ') || (r.address || '').split(' ').slice(0, 2).join(' ') || null,
      lat_g: Math.round(r.lat * 100) / 100, lon_g: Math.round(r.lon * 100) / 100 }));
};

/* =====================================================================
   배경지도 · 행정구역 · 주소 검색
   ===================================================================== */
function baseTiles(opts = {}){
  if (KEYS.vworld)
    return L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${KEYS.vworld}/${KEYS.vworldLayer}/{z}/{y}/{x}.png`,
      { maxZoom: 18, attribution: '© 국토교통부 브이월드', ...opts });
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap', ...opts });
}
let _kakaoP = null;
function kakaoReady(){
  if (!KEYS.kakaoJs) return Promise.reject(new Error('카카오 키 없음'));
  if (_kakaoP) return _kakaoP;
  _kakaoP = (async () => {
    await withTimeout(loadScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEYS.kakaoJs}&libraries=services&autoload=false`), 8000);
    await new Promise(res => kakao.maps.load(res));
    return { geo: new kakao.maps.services.Geocoder(), places: new kakao.maps.services.Places() };
  })().catch(e => { _kakaoP = null; throw e; });
  return _kakaoP;
}
const kcall = (fn, ...args) => new Promise(res => fn(...args, (r, st) => res(st === kakao.maps.services.Status.OK ? r : [])));

async function nominatimReverse(lat, lon){
  try {
    const j = await (await withTimeout(fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&accept-language=ko`), 8000)).json();
    return (j.display_name || '').split(', ').filter(x => x !== '대한민국' && !/^\d{5}$/.test(x)).reverse().join(' ') || null;
  } catch { return null; }
}
/* 좌표 → { address, sido, sigungu, emd, ri, bjd_code }. 카카오 키가 있으면 정확한 법정동 기준, 없으면 주소 문자열만 */
async function regionOf(lat, lon){
  try {
    const k = await kakaoReady();
    const [reg, adr] = await Promise.all([kcall(k.geo.coord2RegionCode.bind(k.geo), lon, lat), kcall(k.geo.coord2Address.bind(k.geo), lon, lat)]);
    const b = reg.find(r => r.region_type === 'B') || reg[0];
    const a = adr[0];
    const address = a ? (a.road_address ? a.road_address.address_name : a.address.address_name) : (b ? b.address_name : null);
    if (b) return { address, sido: b.region_1depth_name || null, sigungu: b.region_2depth_name || null,
                    emd: b.region_3depth_name || null, ri: b.region_4depth_name || null, bjd_code: b.code || null };
  } catch {}
  const address = await nominatimReverse(lat, lon);
  return { address, sido: null, sigungu: null, emd: null, ri: null, bjd_code: null };
}
/* 주소·장소 검색 → [{ label, lat, lon }] */
async function searchPlace(q){
  try {
    const k = await kakaoReady();
    const [adr, kw] = await Promise.all([kcall(k.geo.addressSearch.bind(k.geo), q), kcall(k.places.keywordSearch.bind(k.places), q)]);
    const out = [...adr.map(r => ({ label: r.address_name, lat: +r.y, lon: +r.x })),
                 ...kw.slice(0, 5).map(r => ({ label: `${r.place_name} (${r.road_address_name || r.address_name})`, lat: +r.y, lon: +r.x }))];
    if (out.length) return out.slice(0, 8);
  } catch {}
  try {
    const a = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=kr&limit=5&accept-language=ko`)).json();
    return a.map(x => ({ label: x.display_name.split(', ').filter(s => s !== '대한민국').reverse().join(' '), lat: +x.lat, lon: +x.lon }));
  } catch { return []; }
}

/* 내 신고: 운영판에서는 원자료를 못 읽으므로 기기 ID로만 조회하는 함수(my_reports) 사용 */
SupaStore.myReports = async function(uid){
  const r = await this.c.rpc('my_reports', { p_reporter: uid });
  if (!r.error) return r.data;
  return (await this.listReports()).filter(x => x.reporter_id === uid);     // 시연 권한일 때
};
LocalStore.myReports = async function(uid){ return (await this.listReports()).filter(x => x.reporter_id === uid); };

/* 담당자 로그인 (Supabase Auth, 이메일·비밀번호) */
SupaStore.session = async function(){ const r = await this.c.auth.getSession(); return r.data.session; };
SupaStore.signIn = async function(email, password){ const r = await this.c.auth.signInWithPassword({ email, password }); if (r.error) throw new Error(r.error.message); return r.data.session; };
SupaStore.signOut = async function(){ await this.c.auth.signOut(); };
LocalStore.session = async function(){ return { user: { email: '이 기기(시연)' } }; };

async function initStore(lineEl){
  if (lineEl) lineEl.textContent = '저장소 연결 중…';
  try { await withTimeout(STORE.init(), 15000); if (lineEl) lineEl.innerHTML = `저장소: <b>${esc(STORE.name)}</b>`; }
  catch (err) {
    if (lineEl) lineEl.innerHTML = `<span style="color:var(--rust)">저장소 연결 실패: ${esc(err.message)}</span> 이 기기 저장으로 전환합니다.`;
    STORE = LocalStore; await STORE.init();
  }
}
