# Columnas personalizadas

### Configuración de Columnas Personalizadas en el Administrador de Anuncios

---

### Objetivo

Configurar las **columnas personalizadas** en el administrador de anuncios (Meta/Facebook Ads) para poder analizar las métricas correctas una vez que las campañas están corriendo.

---

### Columnas estándar recomendadas

Estas columnas ya existen en el administrador y se agregan buscando su nombre:

- **Entrega**
- **Último cambio significativo**
- **Importe gastado**
- **Impresiones**
- **Resultados**
- **Costo por resultado**
- **Clics en el enlace**
- **Clics salientes**
- **Me gusta** (ambas variantes disponibles)
- **Visitas a la página de destino**
- **Costo por visita a la página de destino**
- **Compras totales**
- **Costo por compra**
- **Valor de conversión de compras**

---

### Métricas personalizadas (crear manualmente)

Estas métricas **no existen por defecto** y deben construirse desde la opción **"Crear métrica personalizada"**.

---

#### Métrica 1: Porcentaje de visitas a la página de destino

- **Nombre sugerido:** `Visitas página destino %` (o similar)
- **Formato:** Porcentaje

**Fórmula:**

```
Visitas a la página de destino / Clics salientes
```

---

#### Métrica 2: Porcentaje de página (conversión visitas a compras)

- **Nombre sugerido:** `Página porcentaje` (o similar)
- **Formato:** Porcentaje

**Fórmula:**

```
Compras / Visitas a la página de destino
```

---

### Pasos para crear una métrica personalizada

1. Ir a **Columnas** en el administrador de anuncios
2. Seleccionar **"Columnas personalizadas"**
3. Hacer clic en **"Crear métrica personalizada"**
4. Completar:
   - **Nombre de la métrica**
   - **Formato** (porcentaje, número, etc.)
   - **Fórmula** usando los campos disponibles
5. Hacer clic en **"Crear métrica"**

---

### ⚠️ Advertencia importante

> **Guardar el preset antes de crear métricas personalizadas.**
> Si se crea una métrica personalizada sin haber guardado previamente la configuración de columnas, el sistema puede **eliminar todas las columnas agregadas hasta ese momento**.

**Pasos para guardar:**
1. Antes de crear cualquier métrica personalizada, hacer clic en **"Guardar"**
2. Asignar un **nombre al preset**
3. Luego continuar con la creación de métricas personalizadas

---

### Cómo encontrar las métricas personalizadas creadas

- Al buscar columnas, escribir el **nombre exacto** que se le asignó a la métrica
- Aparecerá en los resultados y se puede seleccionar para agregarla a la vista

---

### Nota del instructor

> Las métricas recomendadas en este curso son las que **Luis Mena utiliza personalmente** para analizar campañas, tomar decisiones de optimización y escala. Si en otros entrenamientos se recomendaron métricas distintas, también pueden usarse según preferencia.