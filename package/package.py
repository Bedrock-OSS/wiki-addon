import os
import shutil
import json
import sys

rootdir = './resources'

for addondir in os.listdir(rootdir):
    full_path = os.path.join(rootdir, addondir)

    if os.path.isfile(full_path) or addondir.startswith("."):
        continue
    
    meta_file_path = os.path.join(full_path, "meta.json")
    if not os.path.exists(meta_file_path):
        continue

    with open(meta_file_path, "r") as meta_file:
        try:
            meta = json.load(meta_file)
        except json.JSONDecodeError:
            print(f"Invalid JSON in {meta_file_path}")
            sys.exit(1)

    os.remove(meta_file_path)

    addon_type = meta.get("type")
    
    if addon_type == "mcaddon":
        output_path = os.path.join(rootdir, addondir)
        shutil.make_archive(output_path, 'zip', full_path)
        
        os.rename(f"{output_path}.zip", f"{output_path}.mcaddon")
    
    elif addon_type == "mcpack":
        archive_root = meta.get("archive_root")
        
        subfolder = os.path.join(full_path, archive_root)
        
        if os.path.isdir(subfolder):
            output_path = os.path.join(rootdir, f"{addondir}")

            shutil.make_archive(output_path, 'zip', subfolder)
            os.rename(f"{output_path}.zip", f"{output_path}.mcpack")
        else:
            print(f"{archive_root} folder missing in {addondir}")
            sys.exit(1)
    
    else:
        print(f"Unknown type in meta.json for {addondir}")
        sys.exit(1)