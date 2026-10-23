from pathlib import Path
from PIL import Image
import json, shutil, subprocess, re
root=Path(__file__).resolve().parents[1]
source=root/'public/images'
target=root/'public/images'
target.mkdir(parents=True,exist_ok=True)
manifest=[]
for path in sorted(source.glob('*.jpeg')):
    key=path.stem.removesuffix('-4k')
    destination=target/(key+'-4k.jpeg')
    if path.resolve()!=destination.resolve(): shutil.copy2(path,destination)
    with Image.open(path) as im:
        for width in (640,1280,1920):
            size=(width,round(width*im.height/im.width))
            im.resize(size,Image.Resampling.LANCZOS).save(target/f'{key}-{width}.webp','WEBP',quality=83,method=5)
        manifest.append({'key':key,'original':list(im.size),'variants':[640,1280,1920]})
for item in json.loads((root/'scripts/figma-assets.json').read_text()):
    if (target/item['name']).is_file(): continue
    raise RuntimeError('Missing checked-in Figma asset: '+item['name']+'. Restore it from Git.')
fonts=root/'public/fonts'
fonts.mkdir(exist_ok=True)
for family,filename in [('Poppins:wght@400','poppins-regular'),('Poppins:wght@500','poppins-medium'),('Instrument+Serif','instrument-serif')]:
    css=subprocess.check_output(['curl','-fsSL','-A','Mozilla/5.0','https://fonts.googleapis.com/css2?family='+family+'&display=swap'],text=True)
    urls=re.findall(r'url\((https://[^)]+)\)',css)
    if not urls: raise RuntimeError('No font URL found: '+family)
    subprocess.run(['curl','-fsSL',urls[-1],'-o',str(fonts/(filename+'.woff2'))],check=True)
(root/'src/data/asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print(f'Prepared {len(manifest)} local original photos and responsive variants.')
