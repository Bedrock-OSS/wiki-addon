import os
import shutil
rootdir = '.'

for dirs in os.listdir(rootdir):
    if not os.path.isfile(dirs) and not dirs.startswith("."):
        shutil.make_archive(dirs, 'zip', dirs)
        if dirs.startswith("ma-"):
            os.rename(dirs+".zip", dirs[3:]+".mcaddon")
        elif dirs.startswith("mp-"):
            os.rename(dirs+".zip", dirs[3:]+".mcpack")
        shutil.rmtree(dirs)