import PyInstaller.__main__
import sys
import os

# Define the main script and asset path
script_path = "main.py"
app_name = "AstroSage AI"
icon_path = "../astrosage_ai_icon.png" # Optional, can be icon.ico

# PyInstaller arguments
# --onefile: Bundles everything into a single executable
# --windowed: Hides the console window (GUI mode)
# --noconfirm: Replaces the output directory without asking
# --clean: Cleans PyInstaller cache
# --name: Specific name for the .exe or .app
params = [
    script_path,
    '--onefile',
    '--windowed',
    '--noconfirm',
    '--clean',
    f'--name={app_name}',
    '--add-data=styles.py;.',
    '--add-data=logic.py;.',
]

# Add icon if it exists (PyInstaller expects .ico on Windows, .icns on Mac)
# For now, we'll try to use the PNG or just skip if it's not converted.
# if os.path.exists(icon_path):
#    params.append(f'--icon={icon_path}')

print(f"Building {app_name}...")
PyInstaller.__main__.run(params)
print(f"Build complete! Check the /dist folder for {app_name}.exe")
