# 📸 Carpeta de Fotos de Speakers

## Cómo agregar/revelar a un speaker

1. **Agrega la foto aquí** — en esta carpeta (`/public/assets/speakers/`)
   - Formato recomendado: JPG o PNG
   - Tamaño ideal: **400x400 píxeles** (cuadrada)
   - Nombre del archivo: en minúsculas, sin acentos, con guiones (ej: `carin-leon.jpg`)

2. **Actualiza el archivo de datos** — abre `src/data/program.ts`
   - Encuentra al speaker que quieres revelar
   - Cambia `revealed: false` → `revealed: true`
   - Agrega `photo: 'nombre-archivo.jpg'`

3. **Eso es todo** — el sitio lo mostrará automáticamente

---

## Estado actual de reveals

| Speaker | Estado | Foto |
|---------|--------|------|
| Aurora García de León (Moderadora) | ✅ Revelada | Pendiente agregar foto |
| Fernando García de León (Moderador) | ✅ Revelado | Pendiente agregar foto |
| Dr. Tony Rodríguez | ✅ Revelado | Pendiente agregar foto |
| Alex Reynoso | ✅ Revelado | Pendiente agregar foto |
| Juan Diego Cota "Don Diego" | ✅ Revelado | Pendiente agregar foto |
| Diego Cota Cuevas | ✅ Revelado | Pendiente agregar foto |
| Participantes Conversatorio 1 | 🔒 Oculto | — |
| Artistas Conversatorio 2 | 🔒 Oculto | — |

---

## Nombres de archivo sugeridos

```
aurora-garcia.jpg
fernando-garcia.jpg
tony-rodriguez.jpg
alex-reynoso.jpg
don-diego.jpg
diego-cota.jpg
```
