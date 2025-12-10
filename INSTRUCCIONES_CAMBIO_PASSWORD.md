# 🔐 Instrucciones para Configurar Cambio de Contraseña

## 📋 **Pasos para Activar la Funcionalidad**

### **1️⃣ Configurar Función RPC en Supabase**

#### **Acceder al SQL Editor:**
1. Ve a tu **Dashboard de Supabase**
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **"New Query"**

#### **Ejecutar la Función SQL:**
1. Copia todo el contenido del archivo: `src/supabase/migrations/cambiar_password_usuario.sql`
2. Pégalo en el SQL Editor
3. Haz clic en **"Run"** para ejecutar
4. Verifica que aparezca: ✅ **"Success. No rows returned"**

### **2️⃣ Verificar Permisos**

#### **Verificar que la función se creó:**
```sql
-- Ejecutar esta consulta para verificar:
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'cambiar_password_usuario';
```

#### **Verificar permisos:**
```sql
-- Verificar que los permisos están correctos:
SELECT * FROM information_schema.routine_privileges 
WHERE routine_name = 'cambiar_password_usuario';
```

### **3️⃣ Probar la Funcionalidad**

#### **En la Aplicación:**
1. Inicia sesión como usuario **ROOT**
2. Ve a **Gestión → Personal**
3. Busca un usuario **SUPERADMIN**
4. Haz clic en el botón **🔒** (Cambiar Contraseña)
5. Ingresa nueva contraseña y confirmación
6. Haz clic en **"Cambiar Contraseña"**

#### **Verificar en Consola:**
Abre **DevTools (F12) → Console** y revisa los logs:
```
🔐 Iniciando cambio de contraseña para usuario: [UUID]
👤 Usuario actual: {tipouser: "root", ...}
🚀 Llamando función RPC cambiar_password_usuario...
📊 Respuesta RPC: {data: {success: true, ...}, error: null}
✅ Contraseña cambiada exitosamente
```

### **4️⃣ Solución de Problemas**

#### **❌ Error: "Function cambiar_password_usuario does not exist"**
**Solución:** La función RPC no se ejecutó correctamente
- Vuelve al SQL Editor
- Ejecuta nuevamente el script completo
- Verifica que no hay errores de sintaxis

#### **❌ Error: "operator does not exist: text = uuid"**
**Solución:** Problema de tipos de datos corregido
- La función SQL ha sido actualizada para manejar correctamente los tipos UUID
- Vuelve a ejecutar el script SQL completo actualizado
- El error se debe a comparación incorrecta entre campos UUID y TEXT

#### **❌ Error: "function gen_salt(unknown) does not exist"**
**Solución:** Extensión pgcrypto no disponible - SOLUCIONADO
- La función ha sido actualizada para NO requerir pgcrypto
- Usa método alternativo compatible con todas las configuraciones
- Ejecuta el script SQL actualizado que incluye función sin dependencias

#### **❌ Error: "permission denied for function"**
**Solución:** Faltan permisos
```sql
-- Ejecutar en SQL Editor:
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cambiar_password_usuario(UUID, TEXT) TO service_role;
```

#### **❌ Error: "Solo el usuario root puede cambiar contraseñas"**
**Solución:** Verificar que el usuario logueado es ROOT
- Revisa en la consola el log: `👤 Usuario actual:`
- Asegúrate que `tipouser: "root"`

#### **❌ La contraseña no cambia realmente**
**Solución:** Problema con el hash de contraseña
- Verifica que la función SQL se ejecutó correctamente
- Revisa los logs de Supabase en el Dashboard
- Asegúrate que la extensión `pgcrypto` está habilitada

### **5️⃣ Habilitar Extensión pgcrypto (Si es necesario)**

Si aparece error relacionado con `crypt` o `gen_salt`:

```sql
-- Ejecutar en SQL Editor:
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### **6️⃣ Verificar Cambio de Contraseña**

#### **Método 1: Cerrar sesión y probar**
1. Cierra sesión del usuario SUPERADMIN
2. Intenta iniciar sesión con la **nueva contraseña**
3. Debe permitir el acceso

#### **Método 2: Verificar en base de datos**
```sql
-- Verificar que el hash cambió (solo para debug):
SELECT id, email, encrypted_password, updated_at 
FROM auth.users 
WHERE id = '[UUID_DEL_USUARIO]';
```

### **🚨 Notas Importantes**

#### **Seguridad:**
- ✅ Solo usuarios ROOT pueden cambiar contraseñas
- ✅ Se valida tanto en frontend como backend
- ✅ Las contraseñas se hashean con bcrypt
- ✅ No se almacenan contraseñas en texto plano

#### **Limitaciones:**
- 🔒 Requiere privilegios de base de datos
- 🔒 Funciona solo con usuarios en `auth.users`
- 🔒 No funciona con usuarios de OAuth (Google, etc.)

### **📞 Soporte**

Si sigues teniendo problemas:
1. Revisa los logs en **DevTools → Console**
2. Verifica los logs en **Supabase Dashboard → Logs**
3. Asegúrate que todos los pasos se ejecutaron correctamente

---

**¡La funcionalidad debería estar completamente operativa después de seguir estos pasos!** 🎉
