from PIL import Image
import os

def check_colors(path):
    if not os.path.exists(path):
        return
    img = Image.open(path).convert("RGBA")
    colors = img.getcolors(img.size[0] * img.size[1])
    sorted_colors = sorted(colors, key=lambda x: x[0], reverse=True)
    print(f"--- Colors for {os.path.basename(path)} ---")
    for count, color in sorted_colors[:10]:
        print(f"{count}: {color}")

SPONSORS_DIR = r"c:\Users\chito\Documents\Proyectos digitales\Encuentro Jóvenes Coparmex\public\assets\sponsors"
check_colors(os.path.join(SPONSORS_DIR, "qar_clean.png"))
check_colors(os.path.join(SPONSORS_DIR, "rennergy_clean.png"))
check_colors(os.path.join(SPONSORS_DIR, "porchas_clean.png"))
