# hornet-report — citizen hornet reporting, staff review and public map

**English summary.** A static web app (Korean/English) for reporting hornet **stings** (first screen: call 119, first aid, own location), **nests** and **sightings** with photos and location. Staff review reports every two days (approve/reject, species, basis, nest removal), and approved reports appear on a public map aggregated to about 1 km. It also shows aggregated fire-service nest-removal dispatches (2022–2026) by district and month, and exports pilot-operation metrics (`pilot_metrics.csv`, aggregates only). It links to the daily hornet activity index ([hornet-index](https://github.com/Karl7208/hornet-index)).

- Citizens: https://karl7208.github.io/hornet-report-/ — `index.html` (report), `map.html` (public map), `history.html` (fire-service history)
- Staff: `review.html` (login)
- Back end: Supabase (PostgreSQL with row-level security, Auth, Storage). Front end: plain HTML/JavaScript, Leaflet, Kakao Maps JS SDK (geocoding), VWorld/OSM tiles; hosted on GitHub Pages.
- Privacy: the public map shows approved reports only, with coordinates rounded to 0.01° (~1 km); photos and device data are never public; display copies are re-encoded (no EXIF); originals are kept for 90 days.

**Run locally:** serve the folder with any static web server (e.g. `python -m http.server`) and open `index.html`. A local demo mode (browser storage only, no server) is available for testing. Screenshot script for the paper figure: `tools/fig8/capture_fig8.js` (demo data only).

**Cite:** Min, S.-H., Kim, M.-H., Kim, J.-N., Lee, Y.-B., Lee, K.-Y., Kim, S.-B. An operational hornet-risk system for apiculture and public safety: climate-driven Gi* hotspot forecasting, citizen reporting and CMIP6 projections in South Korea. *Computers and Electronics in Agriculture* (submitted). See also `CITATION.cff`.

---

# 말벌 신고 (hornet-report-)

시민이 말벌 쏘임·벌집·목격을 사진·위치와 함께 신고하고, 담당자가 2일 단위로 검수(승인·반려, 종, 둥지 처리)하면 공개 지도(약 1 km)에 나타납니다. 소방청 벌집 제거 출동(2022–2026)을 시군구·읍면동·월별로 보여 주고, 시범 운영 지표(`pilot_metrics.csv`, 집계만)를 내보냅니다.

- 시민: `index.html`(신고), `map.html`(발생 지도), `history.html`(지난 소방 출동) / 담당자: `review.html`
- 설정·키: `common.js`의 `KEYS`(카카오 JavaScript 키·브이월드 키·Supabase 공개 키 — 모두 브라우저용, 서버 키는 넣지 않음)
- DB 구조: SQL 파일(v3, v5a, v6, v7, 공개 직전 v5b)은 저장소 밖에 보관
