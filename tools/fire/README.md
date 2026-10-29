# 소방 벌집 제거 출동 자료 → 지도용 파일

원본: 정보공개청구 「벌집 제거 현황」(2022.3~2026.8) xlsx, 시군구 경계 `sig.shp`, 읍면동 경계 `emd.shp` (둘 다 2023-07 기준, EPSG:5179)

작업 폴더에 `fire/fire.xlsx`, `sig/sig.shp`, `emd/emd.shp`를 두고 차례로 실행합니다.

```
python agg.py  fire/fire.xlsx fire/raw.pkl          # 시도·연·월·시군구·장소
python agg2.py fire/fire.xlsx fire/raw_emd.pkl      # 시도·연·월·시군구·읍면동
python -c "import shapefile,pandas as pd; r=shapefile.Reader('sig/sig.shp',encoding='cp949'); pd.DataFrame([x.as_dict() for x in r.records()]).to_pickle('sig.pkl')"
python build_emd.py out_emd 40                     # 읍면동 이름 연결 + 시도별 emd_XX.json
python build_fire.py out                           # 시군구×월 fire_nest.json + sgg.geojson
```

나온 파일을 저장소 `data/fire/`에 복사합니다. 공개는 월×시군구·읍면동 건수만, 1~2건은 화면에서 "3건 미만"으로 표시합니다.
