import zipfile
import os

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Create a relative path for the zip record
            rel_path = os.path.relpath(file_path, path)
            # Ensure forward slashes for Linux/Web compatibility
            arcname = rel_path.replace(os.sep, '/')
            ziph.write(file_path, arcname)

if __name__ == '__main__':
    zip_name = 'encuentro_coparmex_dist_FIXED.zip'
    dist_path = 'dist'
    
    if os.path.exists(zip_name):
        os.remove(zip_name)
        
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir(dist_path, zipf)
    print(f"Successfully created {zip_name} with forward slashes.")
