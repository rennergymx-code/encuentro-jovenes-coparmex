from PIL import Image
import os

def make_pure_white(input_path, output_path):
    """
    Converts all non-transparent pixels to pure white.
    """
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # If pixel is not fully transparent and has some alpha
            if item[3] > 0:
                # Keep original alpha but make pixel white
                new_data.append((255, 255, 255, item[3]))
            else:
                new_data.append((255, 255, 255, 0))

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Saved pure white version to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    base_dir = "public/assets/sponsors"
    
    # Process remaining logos that are already transparent but need to be white
    make_pure_white(f"{base_dir}/qar_orig.png", f"{base_dir}/qar_clean.png")
    make_pure_white(f"{base_dir}/vital_orig.png", f"{base_dir}/vital_clean.png")
    make_pure_white(f"{base_dir}/impulsores_orig.png", f"{base_dir}/impulsores_clean.png")
