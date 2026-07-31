# Prueba de eventos

### Configuración del Pixel en Jolva

#### Pasos para instalar el Pixel

- Ingresar a **Jolva** y buscar el producto correspondiente
- Ir a **"Mis Productos"** y seleccionar el producto deseado
- Hacer clic en la sección de **"Herramientas"**
- En el buscador escribir **"pixel"**
- Seleccionar la opción **"Facebook + Instagram"**

---

### Obtener el ID del Pixel

- El **ID del Pixel** se encuentra en la sección de **Configuración** dentro del administrador de Meta
- Copiar el ID y pegarlo en el campo correspondiente dentro de Jolva
- Asegurarse de que todos los campos estén correctamente seleccionados
- Hacer clic en **"Continuar"**

---

### Configuración de la API de Conversiones

- Activar la opción de **"API de Conversiones"**
- Para obtener el **token** existen dos opciones:
  - Ir a **Configuración** y usar el botón **"Generar Token"**
  - Ir a la sección del Pixel y hacer clic en **"Event Settings"**, donde aparece el token en la parte inferior
- Copiar el token
- Pegarlo en Jolva y hacer clic en **"Verificar Token"**
- Guardar la configuración

---

### Verificación de Eventos

> **Importante:** La detección del pixel puede tardar **algunas horas** luego de la instalación. Si no aparece de inmediato, esperar un par de horas antes de continuar.

#### Pasos para probar eventos

- Ir a la sección de **"Eventos"** dentro del administrador de Meta
- Hacer clic en **"Probar Eventos"**
- Copiar la **URL de la página** que se desea probar
  - Para obtenerla: ir a **"Todas las páginas"**, abrir la página de eventos correspondiente y copiar el link
- Pegar la URL en el campo de prueba de eventos
- Si el pixel está correctamente instalado, comenzará a mostrar actividad

---

### Configuración del Link de Pago en la Página de Eventos

- Ir a **"Mis Productos"** en Jolva
- Acceder a **"Link de Regulación"** para obtener los links de pago
- Copiar el **link de página de pago personalizada**
- Pegarlo en la página de eventos correspondiente
- Guardar los cambios

---

### Solución de Problemas: Pixel no detectado

Si el pixel no comienza a marcarse, seguir estos pasos adicionales:

- Ir al **Dashboard** del sitio
- Navegar a **Scripts / Styles**
- Buscar la configuración del **pixel** en esa sección
- Activar la opción correspondiente en **"Options"** (necesario especialmente si se usa el plugin de **LightSpeed**)
- Guardar los cambios

#### Verificación final

- Abrir el sitio y navegar por la página
- En el panel de prueba de eventos debería comenzar a registrarse el evento **`PageView`**
- Si aparece `PageView`, el pixel está funcionando correctamente

> **Nota:** El paso de configuración en Scripts/Styles es **obligatorio** si se usa **LightSpeed** como constructor. Con otros constructores puede no ser necesario.