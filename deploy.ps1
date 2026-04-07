# Script de Despliegue Automatizado para Hostinger
Write-Host "Iniciando proceso de empaquetado para Hostinger..." -ForegroundColor Cyan

# 1. Construir el proyecto
Write-Host "Paso 1: Generando carpeta 'dist' (Build)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el build. Proceso abortado." -ForegroundColor Red
    exit
}

# 2. Crear el ZIP corregido con Python
Write-Host "Paso 2: Creando ZIP con separadores de ruta correctos..." -ForegroundColor Yellow
python zip_fixed.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al crear el ZIP. Proceso abortado." -ForegroundColor Red
    exit
}

# 3. Respaldo en GitHub (Opcional pero recomendado)
Write-Host "Paso 3: Sincronizando respaldo con GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Compilación para despliegue - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin master

Write-Host "`n¡LISTO! Ya puedes subir el archivo 'encuentro_coparmex_dist_FIXED.zip' a Hostinger." -ForegroundColor Green
Write-Host "Recuerda extraerlo con un punto '.' en el Administrador de Archivos." -ForegroundColor Cyan
