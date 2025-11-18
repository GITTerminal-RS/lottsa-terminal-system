# 🚌 LOTTSA - Terminal Terrestre Reina del Cisne

Sistema integral de información y gestión para el Terminal Terrestre Reina del Cisne de Loja.

## 📱 Características

### 🌐 Sección Informativa (Pública)
- **Información de destinos** y rutas disponibles
- **Horarios actualizados** de todas las cooperativas
- **Cartelera de eventos** y noticias
- **Descarga de APK móvil** para Android
- **Búsqueda inteligente** de destinos y horarios
- **Interfaz responsive** para todos los dispositivos

### 🔧 Sección de Gestión (Administrativa)
- **CRUD completo** de destinos, operadoras y horarios
- **Gestión de multimedia** (imágenes y videos)
- **Sistema de autenticación** con Supabase
- **Reportes y estadísticas**
- **Gestión de cartelera** y publicidad
- **Panel de administración** intuitivo

## 🛠️ Tecnologías

- **Frontend:** React 18 + Vite
- **Styling:** Styled Components
- **Backend:** Supabase (BaaS)
- **State Management:** Zustand + TanStack Query
- **Routing:** React Router DOM
- **Forms:** React Hook Form
- **Icons:** React Icons
- **Notifications:** React Hot Toast

## 🚀 Despliegue

### 📋 Requisitos
- Node.js 18+
- Cuenta en Supabase
- Cuenta en Render.com (para deploy)

### 🔧 Configuración Local

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd inventarios-pro
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

4. **Verificar configuración**
```bash
npm run check-env
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

### 🌐 Deploy en Render

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── atoms/          # Componentes básicos
│   ├── molecules/      # Componentes compuestos
│   ├── organismos/     # Componentes complejos
│   └── templates/      # Plantillas de página
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── pages/              # Páginas principales
├── store/              # Estado global (Zustand)
├── styles/             # Estilos globales
├── supabase/           # Configuración y CRUD
└── assets/             # Recursos estáticos

public/
├── downloads/          # APK móvil
└── ...                 # Assets públicos
```

## 📱 APK Móvil

La aplicación incluye una APK para Android disponible en:
- **URL:** `/downloads/lottsa.apk`
- **Versión:** 1.0
- **Compatibilidad:** Android 5.0+

## 🔒 Seguridad

- ✅ Variables de entorno para credenciales
- ✅ Headers de seguridad configurados
- ✅ Autenticación con Supabase Auth
- ✅ Validación de datos en cliente y servidor
- ✅ HTTPS en producción

## 👥 Equipo de Desarrollo

- **Desarrollador:** Ing. Gilson O. Quezada G.
- **Diseñadora:** Lic. Soraya A. Cuncay C.

## 📞 Contacto

- **Terminal:** 2722198 • 2729592
- **Móvil:** 0989165065 (Claro) • 0962079209 (CNT)
- **Municipio:** 2570407 Ext. 1305

## 📄 Licencia

© 2024 Terminal Terrestre Reina del Cisne - Loja, Ecuador