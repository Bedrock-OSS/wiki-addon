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

    archive_type = meta.get("type")
    archive_root = meta.get("archive_root")

    if archive_root:
        full_archive_root = os.path.join(full_path, archive_root)

        if not os.path.isdir(full_archive_root):
            print(f"{archive_root} folder missing in {addondir}")
            sys.exit(1)
    else:
        full_archive_root = full_path
    
    shutil.make_archive(full_path, 'zip', full_archive_root)
    os.rename(f"{full_path}.zip", f"{full_path}.{archive_type}")
