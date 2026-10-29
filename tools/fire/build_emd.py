import json, os, re, sys, warnings, pandas as pd, numpy as np, shapefile
warnings.filterwarnings('ignore')
from shapely.geometry import shape, mapping
from shapely.ops import transform
from pyproj import Transformer
EOUT = sys.argv[1]; TOL = float(sys.argv[2]) if len(sys.argv) > 2 else 40
src = open('build_fire.py').read()
exec(src.split('pairs = df')[0].replace('OUT = sys.argv[1]', 'OUT=None').replace("df = pd.read_pickle('fire/raw.pkl')", "df = pd.read_pickle('fire/raw_emd.pkl')"))
pairs = df[['sido','sgg']].drop_duplicates(); pairs['cd'] = [resolve(a, b) for a, b in zip(pairs.sido, pairs.sgg)]
df = df.merge(pairs, on=['sido','sgg'], how='left')
r = shapefile.Reader('emd/emd.shp', encoding='cp949')
E = pd.DataFrame([x.as_dict() for x in r.records()]); E['sg'] = E.EMD_CD.str[:5]; E['k'] = E.EMD_KOR_NM.str.replace(' ', '')
LOOK = {(a, b): c for a, b, c in zip(E.sg, E.k, E.EMD_CD)}
RENAME = {'남면@51800':'국토정중앙면','동면@51720':'영귀미면','수주면@51750':'무릉도원면','중동면@51750':'산솔면','새솔동@41590':'송산면'}
def cands(k, cd):
    yield k
    if f'{k}@{cd}' in RENAME: yield RENAME[f'{k}@{cd}']
    if re.search(r'\d가동$', k): yield k[:-1]
    m = re.match(r'^(\D+?)\d+동$', k)
    if m: yield m.group(1) + '동'
    if k.endswith('면'): yield k[:-1] + '읍'
    if k.endswith('읍'): yield k[:-1] + '면'
def resolve_emd(sgg_raw, cd, emd):
    k = emd.replace(' ', '')
    if not k or cd is None or (isinstance(cd, float)): return cd, None
    sgs = [cd]
    if sgg_raw.replace(' ', '') in ('제물포구', '영종구'): sgs = ['28110', '28140']
    for c in cands(k, cd):
        for s in sgs:
            if (s, c) in LOOK: return s, LOOK[(s, c)]
    return cd, None
trip = df[['sgg','cd','emd']].drop_duplicates()
res = [resolve_emd(a, b, c) for a, b, c in zip(trip.sgg, trip.cd, trip.emd)]
trip['cd2'] = [x[0] for x in res]; trip['ecd'] = [x[1] for x in res]
df = df.merge(trip, on=['sgg','cd','emd'], how='left')
df['cd'] = df.cd2
print('읍면동 연결', int(df.ecd.notna().sum()), f'({df.ecd.notna().mean()*100:.2f}%)', '/ 시군구만', int(df.cd.notna().sum() - df.ecd.notna().sum()))
df.to_pickle('fire/raw_emd_resolved.pkl')
months = sorted((df.y.astype(str) + '-' + df.m.astype(str).str.zfill(2)).unique()); mi = {m: i for i, m in enumerate(months)}
df['mi'] = (df.y.astype(str) + '-' + df.m.astype(str).str.zfill(2)).map(mi)
tr = Transformer.from_crs('EPSG:5179', 'EPSG:4326', always_xy=True).transform
def rnd(o):
    if isinstance(o, (list, tuple)):
        if o and isinstance(o[0], (int, float)): return [round(o[0], 4), round(o[1], 4)]
        return [rnd(x) for x in o]
    return o
geo = {}
for sr in r.iterShapeRecords():
    rec = sr.record.as_dict(); g = shape(sr.shape.__geo_interface__)
    g2 = transform(tr, g.simplify(TOL, preserve_topology=True)); gm = mapping(g2)
    geo[rec['EMD_CD']] = (rec['EMD_KOR_NM'], round(g.area / 1e6, 2), {'type': gm['type'], 'coordinates': rnd(gm['coordinates'])})
os.makedirs(EOUT, exist_ok=True); sizes = {}
for pre in sorted(set(E.EMD_CD.str[:2])):
    sub = df[df.ecd.fillna('').str.startswith(pre)]
    cnt = {e: np.bincount(g.mi, minlength=len(months)).tolist() for e, g in sub.groupby('ecd')}
    unk = df[df.cd.fillna('').str.startswith(pre) & df.ecd.isna()]
    unkc = {c: np.bincount(g.mi, minlength=len(months)).tolist() for c, g in unk.groupby('cd')}
    feats = [{'type':'Feature','properties':{'cd':e,'n':geo[e][0],'km2':geo[e][1]},'geometry':geo[e][2]} for e in E[E.EMD_CD.str[:2]==pre].EMD_CD]
    out = {'months': months, 'counts': cnt, 'unknown': unkc, 'geo': {'type':'FeatureCollection','features':feats}}
    p = f'{EOUT}/emd_{pre}.json'; json.dump(out, open(p,'w',encoding='utf-8'), ensure_ascii=False, separators=(',',':')); sizes[pre] = round(os.path.getsize(p)/1024)
print('파일 크기 KB', sizes, '합계', sum(sizes.values()))
