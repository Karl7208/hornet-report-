import openpyxl, pandas as pd, sys
wb = openpyxl.load_workbook(sys.argv[1], read_only=True); rows = []
for ws in wb.worksheets:
    if ws.title in ('집계', '검증 및 이용안내'): continue
    it = ws.iter_rows(values_only=True); next(it)
    for r in it:
        if r[0] is None: continue
        rows.append((ws.title, int(r[0]), int(r[1]), (r[3] or '').strip(), (r[4] or '').strip()))
pd.DataFrame(rows, columns=['sido','y','m','sgg','emd']).to_pickle(sys.argv[2])
