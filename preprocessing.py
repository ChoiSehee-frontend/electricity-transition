from pathlib import Path
import pandas as pd,json,shutil
import argparse
ap=argparse.ArgumentParser();ap.add_argument('raw_csv');ap.add_argument('codebook_csv');ap.add_argument('output_dir');args=ap.parse_args()
O=Path(args.output_dir);O.mkdir(parents=True,exist_ok=True)
d=pd.read_csv(args.raw_csv)
cols=['coal_electricity_twh','renewables_electricity_twh','electricity_generation_twh']
s=d[d.year.between(2000,2024)&(d.iso_code.str.len().eq(3)|d.country.eq('World'))].copy()
assert not s.duplicated(['country','year']).any()
s=s.dropna(subset=cols);s=s[s.electricity_generation_twh.gt(0)]
counts=s.groupby('country').year.nunique();names=counts[counts.eq(25)].index;s=s[s.country.isin(names)]
base_countries=s.loc[s.country.ne('World'),'country'].nunique()
active=s.groupby('country').coal_electricity_twh.max()
excluded=active[(active.eq(0))&(active.index!='World')].index.tolist()
s=s[s.country.eq('World')|s.country.isin(active[active.gt(0)].index)]
assert s.loc[s.country.ne('World'),'country'].nunique()==88
assert (s[cols]>=0).all().all()
s['other']=s.electricity_generation_twh-s.coal_electricity_twh-s.renewables_electricity_twh
assert s.other.min()>-0.05
s['other']=s.other.clip(lower=0)
out={n:[[int(r.year),round(r.coal_electricity_twh,3),round(r.renewables_electricity_twh,3),round(r.electricity_generation_twh,3)] for r in g.itertuples()] for n,g in s.groupby('country')}
(O/'data.js').write_text('const DATA='+json.dumps(out,ensure_ascii=False)+';',encoding='utf-8')
s[['country','iso_code','year']+cols+['other']].to_csv(O/'prepared_data.csv',index=False,encoding='utf-8-sig')
shutil.copy(Path(args.codebook_csv),O/'codebook.csv')
(O/'audit.json').write_text(json.dumps({'period':[2000,2024],'geographies':len(out),'country_territory_count':len(out)-1,'complete_country_territory_count_before_coal_filter':base_countries,'all_period_zero_coal_excluded_count':len(excluded),'all_period_zero_coal_excluded_names':excluded,'rows':len(s),'duplicates':0,'missing_values_in_final':0,'selection':'ISO3 country/territory with all 25 years complete for three generation variables and total > 0; keep if coal TWh > 0 at least once in fixed 2000-2024; preserve World independently without recalculating its aggregate','access_date':'2026-10-23'},ensure_ascii=False,indent=2),encoding='utf-8')
print(len(out),'geographies;',len(s),'complete rows')
