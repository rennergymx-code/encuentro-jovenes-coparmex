import os
from PIL import Image, ImageOps, ImageChops

def refine_logo(input_path, output_path, target_height=60, remove_color=None, threshold=50):
    """
    Refines a logo by removing background, making it pure white, and cropping it.
    """
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    try:
        img = Image.open(input_path).convert("RGBA")
        
        # 1. Background Removal
        datas = img.getdata()
        newData = []
        
        for item in datas:
            r, g, b, a = item
            
            should_remove = False
            
            # If already semi-transparent, keep it for now but check if it's "dull"
            if a < 30:
                should_remove = True
                
            if remove_color:
                # Check distance to remove_color
                tr, tg, tb = remove_color
                # Simple Euclidean distance
                dist = ((r - tr)**2 + (g - tg)**2 + (b - tb)**2)**0.5
                if dist < threshold:
                    should_remove = True
            
            # Default: remove whites if color not specified
            elif r > 230 and g > 230 and b > 230:
                should_remove = True
                
            if should_remove:
                newData.append((0, 0, 0, 0))
            else:
                # Force to WHITE (we want white logos)
                newData.append((255, 255, 255, 255))

        img.putdata(newData)
        
        # 2. Crop to content
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # 3. Add padding and resize
        padding = 10
        new_img = Image.new("RGBA", (img.width + 2*padding, img.height + 2*padding), (0,0,0,0))
        new_img.paste(img, (padding, padding))
        
        # Resize to target height
        if new_img.size[1] > 0:
            h_percent = (target_height / float(new_img.size[1]))
            w_size = int((float(new_img.size[0]) * float(h_percent)))
            final_img = new_img.resize((w_size, target_height), Image.Resampling.LANCZOS)
            final_img.save(output_path, "PNG")
            print(f"Processed: {output_path}")
        else:
            print(f"Skipping empty: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Target paths
SPONSORS_DIR = r"c:\Users\chito\Documents\Proyectos digitales\Encuentro Jóvenes Coparmex\public\assets\sponsors"

# Specific fixes
# Nissan: Background is red (255,0,0). Filter out red.
refine_logo(os.path.join(SPONSORS_DIR, "nissan_clean.png"), os.path.join(SPONSORS_DIR, "nissan_clean.png"), target_height=60, remove_color=(255, 0, 0), threshold=150)

# SECOIP: Background is dark (0,0,0). Filter out dark.
refine_logo(os.path.join(SPONSORS_DIR, "secoip_clean.png"), os.path.join(SPONSORS_DIR, "secoip_clean.png"), target_height=60, remove_color=(0, 0, 0), threshold=150)

# Porchas: White background.
refine_logo(os.path.join(SPONSORS_DIR, "porchas_clean.png"), os.path.join(SPONSORS_DIR, "porchas_clean.png"), target_height=60)

# Rennergy: Blue background.
refine_logo(os.path.join(SPONSORS_DIR, "rennergy_clean.png"), os.path.join(SPONSORS_DIR, "rennergy_clean.png"), target_height=60, remove_color=(0, 100, 200), threshold=150)

# Re-normalize all
refine_logo(os.path.join(SPONSORS_DIR, "arco_clean.png"), os.path.join(SPONSORS_DIR, "arco_clean.png"), target_height=60)
refine_logo(os.path.join(SPONSORS_DIR, "qar_clean.png"), os.path.join(SPONSORS_DIR, "qar_clean.png"), target_height=60)
refine_logo(os.path.join(SPONSORS_DIR, "vital_clean.png"), os.path.join(SPONSORS_DIR, "vital_clean.png"), target_height=60)
refine_logo(os.path.join(SPONSORS_DIR, "impulsores_clean.png"), os.path.join(SPONSORS_DIR, "impulsores_clean.png"), target_height=60)
