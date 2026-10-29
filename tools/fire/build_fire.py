import json, sys, pandas as pd, numpy as np, shapefile
from shapely.geometry import shape, mapping
from shapely.ops import transform
import warnings; warnings.filterwarnings('ignore')
from pyproj import Transformer
OUT = sys.argv[1]
sig = pd.read_pickle('sig.pkl'); df = pd.read_pickle('fire/raw.pkl')
SIDO_PRE = {'서울':'11','부산':'26','대구':'27','인천':'28','광주':'29','대전':'30','울산':'31','세종':'36','경기':'41',
            '강원':'51','충북':'43','충남':'44','전북':'45','전남':'46','경북':'47','경남':'48','창원':'48','제주':'50'}
PRE_SIDO = {'11':'서울','26':'부산','27':'대구','28':'인천','29':'광주','30':'대전','31':'울산','36':'세종','41':'경기',
            '51':'강원','43':'충북','44':'충남','45':'전북','46':'전남','47':'경북','48':'경남','50':'제주'}
sig['pre'] = sig.SIG_CD.str[:2]; sig['key'] = sig.SIG_KOR_NM.str.replace(' ', '')
REMAP = {('경기','화성시만세구'):'화성시',('경기','화성시동탄구'):'화성시',('경기','화성시효행구'):'화성시',('경기','화성시병점구'):'화성시',
         ('경기','부천시소사구'):'부천시',('경기','부천시원미구'):'부천시',('경기','부천시오정구'):'부천시',
         ('인천','영종구'):'중구',('인천','제물포구'):'중구',('인천','검단구'):'서구',('인천','서해구'):'서구',('인천','남구'):'미추홀구'}
GWANGJU = {'광산구','북구','남구','서구','동구'}
SIDO_ONLY = {'서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','경기도',
             '강원도','강원특별자치도','충청북도','충청남도','전라북도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도'}
by_name = sig.groupby('key').SIG_CD.apply(list).to_dict()
def resolve(sido, sgg):
    k = sgg.replace(' ', '')
    if not k or sgg in SIDO_ONLY: return None
    k = REMAP.get((sido, k), k).replace(' ', '')
    pre = SIDO_PRE[sido]
    if sido == '전남' and k in GWANGJU: pre = '29'
    if sido == '경북' and k == '군위군': pre = '27'
    hit = sig[(sig.pre == pre) & (sig.key == k)]
    if len(hit): return hit.SIG_CD.iloc[0]
    c = by_name.get(k, [])
    return c[0] if len(c) == 1 else None       # 다른 시도 본부가 출동한 경우(소수), 이름이 유일할 때만
pairs = df[['sido','sgg']].drop_duplicates()
pairs['cd'] = [resolve(a, b) for a, b in zip(pairs.sido, pairs.sgg)]
df = df.merge(pairs, on=['sido','sgg'], how='left')
_res = pd.read_pickle('fire/raw_emd_resolved.pkl')
assert len(_res) == len(df) and (_res.sgg.values == df.sgg.values).all()
df['cd'] = _res.cd.values            # 읍면동으로 시군구를 바로잡은 값 (인천 제물포구 → 동구 등)
df['sido2'] = np.where(df.cd.notna(), df.cd.str[:2].map(PRE_SIDO), df.sido.replace({'창원':'경남'}))
print('지도에 표시', int(df.cd.notna().sum()), '/ 시군구 미상', int(df.cd.isna().sum()))
df['ym'] = df.y.astype(str) + '-' + df.m.astype(str).str.zfill(2)
months = sorted(df.ym.unique())
mi = {m:i for i,m in enumerate(months)}
# 시군구 × 월
cnt = {}
for cd, g in df[df.cd.notna()].groupby('cd'):
    arr = [0]*len(months)
    for ym, n in g.groupby('ym').size().items(): arr[mi[ym]] = int(n)
    cnt[cd] = arr
# 시도 × 월 (미상 포함 전체)
sido_cnt = {}
for s, g in df.groupby('sido2'):
    arr = [0]*len(months)
    for ym, n in g.groupby('ym').size().items(): arr[mi[ym]] = int(n)
    sido_cnt[s] = arr
# 장소(대분류) — 전국 연도별, 시군구 전기간
top = df.place.value_counts()
places = [p for p in top.index if p not in ('기타','미상')][:11] + ['기타']
df['pl'] = np.where(df.place.isin(places), df.place, '기타')
years = sorted(df.y.unique().tolist())
place_year = {p: [int(((df.pl == p) & (df.y == y)).sum()) for y in years] for p in places}
place_sgg = {cd: [int(n) for n in g.pl.value_counts().reindex(places, fill_value=0)] for cd, g in df[df.cd.notna()].groupby('cd')}
# 경계: EPSG:5179 → 4326, 단순화
tr = Transformer.from_crs('EPSG:5179', 'EPSG:4326', always_xy=True).transform
r = shapefile.Reader('sig/sig.shp', encoding='cp949')
feats, regions = [], []
for sr in r.iterShapeRecords():
    rec = sr.record.as_dict(); g = shape(sr.shape.__geo_interface__)
    area = g.area / 1e6
    g2 = transform(tr, g.simplify(250, preserve_topology=True))
    def rnd(o):
        if isinstance(o, (list, tuple)):
            if o and isinstance(o[0], (int, float)): return [round(o[0], 4), round(o[1], 4)]
            return [rnd(x) for x in o]
        return o
    gm = mapping(g2); gm = {'type': gm['type'], 'coordinates': rnd(gm['coordinates'])}
    feats.append({'type':'Feature','properties':{'cd':rec['SIG_CD']},'geometry':gm})
    regions.append({'cd':rec['SIG_CD'],'sido':PRE_SIDO[rec['SIG_CD'][:2]],'name':rec['SIG_KOR_NM'],'km2':round(area,1)})
data = {'source':'소방청 구조·생활안전활동 기록지 (정보공개청구), 공식 사고원인 "벌(집)제거"',
        'period':['2022-03','2026-08'], 'note':'2022년은 3~12월, 2026년은 1~8월 자료',
        'generated':'2026-10-29','months':months,'years':years,'regions':regions,'counts':cnt,
        'sido':sido_cnt,'places':places,'place_year':place_year,'place_sgg':place_sgg,
        'unmapped':int(df.cd.isna().sum()),'total':int(len(df))}
import os; os.makedirs(OUT, exist_ok=True)
json.dump(data, open(f'{OUT}/fire_nest.json','w',encoding='utf-8'), ensure_ascii=False, separators=(',',':'))
json.dump({'type':'FeatureCollection','features':feats}, open(f'{OUT}/sgg.geojson','w',encoding='utf-8'), separators=(',',':'))
print({f: round(os.path.getsize(f'{OUT}/{f}')/1024) for f in os.listdir(OUT)}, 'KB')
print('시군구 수', len(cnt), '/ 월 수', len(months), months[0], months[-1])
