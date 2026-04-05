from PIL import Image
import os

def remove_background(input_path, output_path, target_color, tolerance=30):
    """
    Removes a specific color from an image and makes it transparent.
    target_color: (R, G, B)
    """
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Check if color is within tolerance
        if all(abs(item[i] - target_color[i]) <= tolerance for i in range(3)):
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

def make_white(input_path, output_path):
    """
    Converts all non-transparent pixels to pure white.
    """
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[3] > 10: # If not transparent
            new_data.append((255, 255, 255, 255)) # Pure white
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved white version to {output_path}")

# Nissan (Red bg: ~191, 10, 48)
# SECOIP (Dark bg: ~43, 44, 42)
# Rennergy (Dark bg: ~26, 26, 26)

if __name__ == "__main__":
    base_dir = "public/assets/sponsors"
    
    # 1. Nissan
    remove_background(f"{base_dir}/nissan_orig.png", f"{base_dir}/nissan_tmp.png", (191, 10, 48), 60)
    make_white(f"{base_dir}/nissan_tmp.png", f"{base_dir}/nissan_clean.png")
    
    # 2. SECOIP
    remove_background(f"{base_dir}/secoip_orig.png", f"{base_dir}/secoip_tmp.png", (43, 44, 42), 40)
    make_white(f"{base_dir}/secoip_tmp.png", f"{base_dir}/secoip_clean.png")

    # 3. Rennergy
    remove_background(f"{base_dir}/rennergy_orig.png", f"{base_dir}/rennergy_tmp.png", (26, 26, 26), 40)
    make_white(f"{base_dir}/rennergy_tmp.png", f"{base_dir}/rennergy_clean.png")

    # 4. Arco (often has white bg)
    remove_background(f"{base_dir}/arco_orig.png", f"{base_dir}/arco_tmp.png", (255, 255, 255), 40)
    make_white(f"{base_dir}/arco_tmp.png", f"{base_dir}/arco_clean.png")

    # Clean up tmp files
    for f in ["nissan_tmp.png", "secoip_tmp.png", "rennergy_tmp.png", "arco_tmp.png"]:
        path = f"{base_dir}/{f}"
        if os.path.exists(path):
            os.remove(path)
