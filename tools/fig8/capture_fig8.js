/* =====================================================================
   논문 2 그림 8용 화면 캡처 6장 (영문 화면, 시연 자료만 — 실제 신고·개인정보 없음)

   준비 (한 번):  npm i playwright leaflet@1.9.4 leaflet.markercluster@1.5.3 && npx playwright install chromium
   실행:
     node capture_fig8.js --report <hornet-report- 폴더> --index <hornet-index 폴더> --out <저장 폴더> [--offline]

   · 두 앱을 이 PC에서 띄워(127.0.0.1:8001, 8002) 캡처합니다. 신고·검수 화면은 "이 기기(시연)" 저장소에
     만든 가짜 신고 80건만 씀 (주소는 시군구까지, 사진은 DEMO PHOTO 그림).
   · --offline: 인터넷이 막힌 곳에서 — Leaflet은 node_modules에서, 배경지도 타일 대신 시군구 경계를 깔고 그림.
     인터넷이 되는 PC에서는 --offline 없이 실행하면 실제 배경지도(브이월드/OSM)로 찍힘.
   · 전국 지수(e)·우리 지역(d)은 hornet-index의 data/latest 를 씀 → 먼저 python run_daily.py --no-fetch --date 2026-08-20
   휴대폰 390×844 (2배), PC 폭 1440 (2배)
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const REPORT = path.resolve(arg('--report') || '../..');
const INDEX = path.resolve(arg('--index') || '../../../hornet-index');
const OUT = path.resolve(arg('--out') || 'fig8');
const OFFLINE = process.argv.includes('--offline');
const NM = path.resolve(arg('--node-modules') || path.join(__dirname, 'node_modules'));
const DEMO_DIR = __dirname;
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.csv': 'text/csv; charset=utf-8', '.geojson': 'application/json', '.svg': 'image/svg+xml' };
function serve(root, port){
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
      fs.readFile(p.endsWith('/') ? p + 'index.html' : p, (e, b) => {
        if (e) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
      });
    }).listen(port, '127.0.0.1', () => res(s));
  });
}
const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');   // 투명 1×1
const SGG = fs.readFileSync(path.join(REPORT, 'data', 'fire', 'sgg.geojson'));

async function routes(ctx){
  const file = (p, type) => r => r.fulfill({ body: fs.readFileSync(p), contentType: type });
  await ctx.route('**/*', r => {                         // 바깥 요청: 오프라인이면 막고, 아래 규칙만 통과
    const u = r.request().url();
    if (u.startsWith('http://127.0.0.1')) return r.continue();
    if (!OFFLINE && !/raw\.githubusercontent|nominatim|dapi\.kakao/.test(u)) return r.continue();
    if (/fonts\.(googleapis|gstatic)/.test(u)) return r.fulfill({ body: '', contentType: 'text/css' });
    if (/leaflet\.markercluster.*\.js/.test(u)) return file(path.join(NM, 'leaflet.markercluster/dist/leaflet.markercluster.js'), 'text/javascript')(r);
    if (/MarkerCluster\.Default\.css/.test(u)) return file(path.join(NM, 'leaflet.markercluster/dist/MarkerCluster.Default.css'), 'text/css')(r);
    if (/MarkerCluster\.(min\.)?css/.test(u)) return file(path.join(NM, 'leaflet.markercluster/dist/MarkerCluster.css'), 'text/css')(r);
    if (/leaflet\/1\.9\.4\/leaflet(\.min)?\.js/.test(u)) return file(path.join(NM, 'leaflet/dist/leaflet.js'), 'text/javascript')(r);
    if (/leaflet\/1\.9\.4\/leaflet(\.min)?\.css/.test(u)) return file(path.join(NM, 'leaflet/dist/leaflet.css'), 'text/css')(r);
    if (/leaflet\/1\.9\.4\/images\/(.+\.png)/.test(u)) return file(path.join(NM, 'leaflet/dist/images', u.match(/images\/(.+\.png)/)[1]), 'image/png')(r);
    if (/tile\.openstreetmap|api\.vworld/.test(u)) return r.fulfill({ body: PNG1, contentType: 'image/png' });
    if (/nominatim.*reverse/.test(u)) return r.fulfill({ body: JSON.stringify({ display_name: '덕진구, 전주시, 전북특별자치도, 대한민국' }), contentType: 'application/json' });
    if (/raw\.githubusercontent.*runlog\.csv/.test(u)) {
      const p = path.join(INDEX, 'data', 'archive', 'runlog.csv');
      return fs.existsSync(p) ? file(p, 'text/csv')(r) : r.fulfill({ status: 404, body: '' });
    }
    return r.abort();
  });
}
/* 오프라인 배경: 시군구 경계를 땅색으로, 바다는 연한 파랑 */
async function backdrop(page, mapVar){
  if (!OFFLINE) return;
  await page.evaluate(([gj, v]) => {
    const m = window.eval(v); if (!m || !window.L) return;
    m.getContainer().style.background = '#d6e6ef';
    if (!m.getPane('bd')) { m.createPane('bd'); m.getPane('bd').style.zIndex = 150; }
    L.geoJSON(JSON.parse(gj), { pane: 'bd', interactive: false, style: { color: '#a9b8a4', weight: .6, fillColor: '#eef2e8', fillOpacity: 1 } }).addTo(m);
  }, [SGG.toString(), mapVar]);
}

/* ---------- 시연 자료 (가짜) ---------- */
const PLACES = [  // [시도, 시군구, 위도, 경도]
  ['전북특별자치도', '전주시 덕진구', 35.85, 127.12], ['전북특별자치도', '완주군', 35.90, 127.20], ['전북특별자치도', '김제시', 35.80, 126.88],
  ['전라남도', '순천시', 34.95, 127.49], ['전라남도', '나주시', 35.02, 126.71], ['경상남도', '진주시', 35.18, 128.10], ['경상남도', '거제시', 34.88, 128.62],
  ['부산광역시', '기장군', 35.24, 129.22], ['울산광역시', '울주군', 35.56, 129.24], ['경상북도', '경주시', 35.84, 129.21], ['경상북도', '안동시', 36.57, 128.73],
  ['대구광역시', '달성군', 35.77, 128.43], ['충청남도', '공주시', 36.45, 127.12], ['충청남도', '서산시', 36.78, 126.45], ['충청북도', '충주시', 36.99, 127.93],
  ['대전광역시', '유성구', 36.36, 127.36], ['세종특별자치시', '세종시', 36.48, 127.29], ['경기도', '화성시', 37.20, 126.83], ['경기도', '용인시 처인구', 37.23, 127.20],
  ['경기도', '가평군', 37.83, 127.51], ['강원특별자치도', '원주시', 37.34, 127.92], ['강원특별자치도', '강릉시', 37.75, 128.88], ['서울특별시', '노원구', 37.65, 127.06],
  ['인천광역시', '강화군', 37.75, 126.49], ['제주특별자치도', '제주시', 33.45, 126.56], ['광주광역시', '북구', 35.17, 126.91]];
function demoReports(){
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const wpick = w => { let x = rnd() * w.reduce((s, v) => s + v[1], 0); for (const [k, v] of w) { if ((x -= v) <= 0) return k; } return w[0][0]; };
  const out = [], now = new Date('2026-11-05T10:00:00+09:00');
  for (let i = 0; i < 80; i++) {
    const [sido, sgg, la, lo] = pick(PLACES);
    const type = wpick([['벌집', 50], ['말벌', 35], ['쏘임', 15]]);
    const pending = i < 12;
    const created = new Date(now - (pending ? rnd() * 2 : 2 + rnd() * 33) * 864e5);
    const status = pending ? '접수' : wpick([['승인', 82], ['반려', 18]]);
    const sp = status === '승인' ? wpick([['등검은말벌', 45], ['장수말벌', 20], ['말벌', 15], ['좀말벌', 8], ['꼬마장수말벌', 5], ['털보말벌', 2], ['판별불가', 5]]) : null;
    const seen = new Date(created - rnd() * 2 * 864e5);
    const ymd = d => new Date(d.getTime() + 9 * 36e5).toISOString().slice(0, 10);
    const r = {
      report_id: `H-DEMO-${String(i + 1).padStart(3, '0')}`, created_at: created.toISOString(), reporter_id: 'demo-' + (i % 30),
      track: type === '쏘임' ? '응급' : '관측', report_type: type, seen_date: ymd(seen), seen_date_source: '직접입력',
      lat: +(la + (rnd() - .5) * .12).toFixed(5), lon: +(lo + (rnd() - .5) * .12).toFixed(5), location_method: '현재위치', location_accuracy_m: 12,
      address: `${sido} ${sgg}`, sido, sigungu: sgg, emd: null, ri: null, bjd_code: null,
      place_type: type === '쏘임' ? null : pick(['집·건물', '길·공원', '산·들', '양봉장', '집·건물', '학교·어린이집']),
      nest_site: type === '말벌' ? null : pick(['나무 가지', '건물 외부', '땅속', '나무 구멍']),
      sting_count: type === '쏘임' ? 1 + Math.floor(rnd() * 3) : null, sting_severity: type === '쏘임' ? pick(['국소', '국소', '병원치료']) : null,
      activity: type === '쏘임' ? pick(['벌초·성묘', '등산·산행', '농작업']) : null, memo: null,
      n_photos: rnd() < .85 ? 1 + Math.floor(rnd() * 2) : 0, status, species: sp, species_basis: sp ? pick(['개체확인', '둥지형태추정']) : null,
      reviewer: pending ? null : 'demo', reviewed_at: pending ? null : new Date(created.getTime() + (6 + rnd() * 40) * 36e5).toISOString(),
      reject_reason: status === '반려' ? pick(['말벌 아님', '말벌 아님', '사진 불량', '중복']) : null, app_version: 'v2.0', ui_lang: rnd() < .06 ? 'en' : 'ko'
    };
    r.priority = r.track === '응급' || ['집·건물', '학교·어린이집', '길·공원', '양봉장'].includes(r.place_type);
    if (status === '승인' && type === '벌집') {
      const closed = rnd() < .6;
      r.nest_status = closed ? pick(['제거됨', '제거됨', '사라짐']) : '활동중';
      r.nest_status_at = closed ? ymd(new Date(seen.getTime() + (1 + rnd() * 6) * 864e5)) : r.seen_date;
      r.nest_handler = closed ? pick(['소방', '소방', '지자체', '방제업체', '자진 소멸']) : null;
    }
    out.push(r);
  }
  return out;
}
async function seed(page){
  const photos = [1, 2, 3].map(i => fs.readFileSync(path.join(DEMO_DIR, `demo${i}.jpg`)).toString('base64'));
  await page.evaluate(async ([reports, photos]) => {
    await STORE.init(); await STORE.wipe();
    for (const r of reports) {
      const media = [], blobs = {};
      for (let k = 0; k < r.n_photos; k++) {
        const b64 = photos[(parseInt(r.report_id.slice(-3)) + k) % 3];
        const blob = new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
        const path = `display/2026/11/${r.report_id}-${k + 1}.jpg`;
        blobs[path] = blob;
        media.push({ media_id: `${r.report_id}-${k + 1}`, report_id: r.report_id, seq: k + 1, display_path: path, orig_status: '보관',
          display_width: 1200, display_height: 900, created_at: r.created_at });
      }
      await STORE.saveReport(r, media, blobs);
    }
  }, [demoReports(), photos]);
}

(async () => {
  const s1 = await serve(REPORT, 8001), s2 = await serve(INDEX, 8002);
  const browser = await chromium.launch();
  const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-GB',
    geolocation: { latitude: 35.8467, longitude: 127.1290 }, permissions: ['geolocation'] };
  const pc = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-GB' };
  const init = `try { localStorage.setItem('hr.cfg', JSON.stringify({ mode: 'local' })); localStorage.setItem('hr.lang', 'en'); } catch {}`;
  const shot = async (page, name, opt = {}) => { await page.waitForTimeout(900); await page.screenshot({ path: path.join(OUT, name), ...opt }); console.log('  ', name); };

  // 브라우저 창(context)마다 저장소가 따로라서, 신고 앱을 쓰는 창마다 시연 자료를 먼저 넣음
  const seeded = async ctx => { const p = await ctx.newPage(); await p.goto('http://127.0.0.1:8001/review.html?lang=en'); await p.waitForTimeout(800); await seed(p); await p.close(); };

  // a·b·c 휴대폰 (신고 앱)
  { const ctx = await browser.newContext(phone); await ctx.addInitScript(init); await routes(ctx); await seeded(ctx);
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8001/index.html?lang=en'); await shot(p, 'fig8a_citizen_home.png');
    await p.click('#goObs'); await p.waitForTimeout(400);
    await p.click('#typeSeg button[data-v="벌집"]'); await p.click('#nestSeg button[data-v="나무 가지"]'); await p.click('#placeSeg button[data-v="길·공원"]');
    await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'fig8b1_report_form_what.png');
    await p.setInputFiles('#fileIn', path.join(DEMO_DIR, 'demo1.jpg')); await p.waitForTimeout(1500);
    await p.click('#useHere'); await p.waitForTimeout(2500);
    await backdrop(p, 'mini');
    await p.evaluate(() => { const y = document.getElementById('photoH').getBoundingClientRect().top + window.scrollY - document.querySelector('header').offsetHeight - 24; window.scrollTo(0, y); });
    await shot(p, 'fig8b2_report_form_photo_location.png');
    await p.goto('http://127.0.0.1:8001/map.html?lang=en'); await p.waitForTimeout(2500); await backdrop(p, 'map');
    await shot(p, 'fig8c_public_map.png');
    await ctx.close(); }

  // d 우리 지역 (휴대폰)
  { const ctx = await browser.newContext(phone); await ctx.addInitScript(init); await routes(ctx);
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8002/local.html?lang=en&r=' + encodeURIComponent('전북 전주시 덕진구')); await p.waitForTimeout(2500);
    await backdrop(p, 'map'); await shot(p, 'fig8d_local_view.png');
    await p.evaluate(() => window.scrollBy(0, 760)); await shot(p, 'fig8d_local_view_2.png'); await ctx.close(); }

  // e 전국 1 km 지수 (PC)
  { const ctx = await browser.newContext(pc); await ctx.addInitScript(init); await routes(ctx);
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8002/index.html?lang=en'); await p.waitForTimeout(1500);
    if (OFFLINE) await p.check('input[name=bg][value=white]');
    await p.waitForTimeout(1200); await shot(p, 'fig8e_national_index.png'); await ctx.close(); }

  // f 검수 (PC) + 시범 운영 지표 내려받기 시험
  { const ctx = await browser.newContext({ ...pc, acceptDownloads: true }); await ctx.addInitScript(init); await routes(ctx); await seeded(ctx);
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8001/review.html?lang=en'); await p.waitForTimeout(2500);
    await p.fill('#reviewer', 'Reviewer A');
    await shot(p, 'fig8f_review_queue.png');
    await p.click('nav button[data-t="t-nest"]'); await p.waitForTimeout(1500); await shot(p, 'fig8f_review_nests.png');
    await p.click('nav button[data-t="t-export"]'); await p.fill('#pmFrom', '2026-10-01'); await p.fill('#pmTo', '2026-11-05');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#xPilot')]);
    await dl.saveAs(path.join(OUT, 'pilot_metrics_DEMO.csv')); await p.waitForTimeout(500);
    await shot(p, 'review_pilot_export.png');
    await ctx.close(); }

  await browser.close(); s1.close(); s2.close();
  console.log('끝 →', OUT);
})().catch(e => { console.error(e); process.exit(1); });
