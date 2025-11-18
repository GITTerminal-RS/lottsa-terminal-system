# 🚀 Guía de Despliegue - LOTTSA

## 📋 Variables de Entorno Requeridas

### 🔧 Para Render.com

Configura estas variables en el dashboard de Render:

```env
VITE_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🎯 Cómo Obtener las Variables:

#### 1. **VITE_APP_SUPABASE_URL**
- Ve a tu proyecto en [supabase.com](https://supabase.com)
- Settings → API
- Copia la "Project URL"

#### 2. **VITE_APP_SUPABASE_ANON_KEY**
- En la misma página (Settings → API)
- Copia la "anon public" key

### ⚠️ Notas Importantes:

- ✅ **Estas son claves públicas** - seguras para el frontend
- ✅ **Prefijo VITE_APP_** es obligatorio para Vite
- ✅ **Se incluyen en el bundle** del cliente
- ❌ **NO incluyas claves privadas** aquí

## 🛠️ Configuración en Render

### 📦 Build Settings:
```
Build Command: npm install && npm run build
Publish Directory: ./dist
```

### 🌐 Environment Variables:
```
VITE_APP_SUPABASE_URL = [tu URL de Supabase]
VITE_APP_SUPABASE_ANON_KEY = [tu clave anon de Supabase]
```

## 📱 Archivos Estáticos

### 📥 APK Móvil:
- **Ubicación:** `public/downloads/lottsa.apk`
- **URL final:** `https://tu-app.onrender.com/downloads/lottsa.apk`
- **Tamaño actual:** ~[tamaño de tu APK]

### 🖼️ Assets:
- **Imágenes:** Optimizadas automáticamente por Vite
- **Videos:** `PortadaPG.mp4` incluido en el build
- **Iconos:** Todos los assets están incluidos

## 🔍 Verificación Post-Deploy

### ✅ Checklist:
- [ ] Aplicación carga correctamente
- [ ] Login/Auth funciona con Supabase
- [ ] Sección informativa muestra datos
- [ ] Descarga de APK funciona
- [ ] Todas las imágenes cargan
- [ ] Videos se reproducen correctamente
- [ ] Formularios funcionan (CRUD)

### 🐛 Troubleshooting:
- **Error de conexión:** Verificar variables de Supabase
- **404 en assets:** Verificar que el build se completó
- **APK no descarga:** Verificar que está en `/downloads/`
