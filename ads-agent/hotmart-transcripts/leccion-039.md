# Instalar Wordpress

### Instalación de WordPress en tu Dominio

---

### Acceso al Panel de Hosting

- Una vez dentro del panel de hosting, dirigite a la sección **"Sitio Web"** (barra lateral izquierda) o **"Dominio"** (justo debajo de Sitio Web)
- En **Dominio** vas a ver únicamente el dominio que elegiste al contratar el hosting
- Si contratás el **plan de $2/mes** (o superior), el dominio es **gratuito**

---

### Paso 1: Agregar un Nuevo Sitio Web

- En la sección **"Sitio Web"**, si no tenés nada instalado, aparecerá vacía
- Hacé clic en **"Añadir sitio web"**
- El sistema te va a pedir:
  - **Nombre de usuario** de WordPress
  - **Contraseña** de WordPress

#### Requisitos de la contraseña
- De **8 a 50 caracteres**
- Al menos **una letra mayúscula**
- Al menos **una letra minúscula**
- Al menos **un número**
- Al menos **un símbolo**
- Solo letras del **alfabeto latino**

> ⚠️ Recomendación: anotá la contraseña en el momento para no olvidarla.

---

### Paso 2: Tipo de Sitio Web

- El instalador pregunta cómo querés crear tu sitio
- Seleccioná la opción **"Sitio web en blanco"** *(opción recomendada)*

---

### Paso 3: Selección del Dominio

- Elegí el **dominio que compraste** en el paso anterior
- Hacé clic en **"Próximo"**
- La instalación puede tardar **aproximadamente un minuto**

---

### Paso 4: Acceso al Panel de WordPress (wp-admin)

Una vez instalado, la URL de acceso al panel de administración es:

```
tudominio.com/wp-admin
```

- Ingresás con el **usuario** y **contraseña** que configuraste en el Paso 1
- Desde ahí gestionás todo tu sitio

---

### Configuraciones Iniciales Recomendadas

#### Permalinks (Estructura de URLs)
- Ir a: **Ajustes → Permalinks**
- Verificar que esté seleccionada la opción **"Nombre de la entrada"**
- Si aparece otra opción activa, cambiala a **"Nombre de la entrada"**
- Hacé clic en **"Guardar cambios"**

#### Idioma del sitio
- Ir a: **Ajustes → General**
- Seleccioná el **español de tu país** (España, Colombia, Perú, Chile, Venezuela, Ecuador, etc.)
- Hacé clic en **"Guardar cambios"**

#### HTTPS (Seguridad del sitio)
- En **Ajustes → General**, verificar que la **dirección de WordPress** empiece con:

```
https://tudominio.com
```

- Si dice `http://` (sin la **s**), el sitio **no estará protegido**
- Es importante que figure **`https`** para que el sitio esté seguro ante internet

---

### Próximo Video

- Se verán los **plugins y herramientas recomendados** para instalar en WordPress