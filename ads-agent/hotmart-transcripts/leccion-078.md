# Configurar Embudo de Ventas en Hotmart

### Configurar Embudo de Ventas en Hotmart

---

### Requisitos previos

- Tener listas todas las páginas:
  - Página de **opt-in** (opción de suscripción)
  - Página de **downsell**
  - Página de **upsell** (OTO - One Time Offer)
- Una vez listas, se configura todo dentro de **Hotmart** para que funcione de manera automática

---

### Crear un nuevo embudo de ventas

- Ir a **Herramientas** dentro de Hotmart
- Buscar la opción **"Embudo de Ventas"**
- Hacer clic en **"Nuevo embudo"**
- Completar los datos solicitados:
  - **Nombre del embudo:** colocar algo relacionado al producto (ejemplo: `Finanzas`)
  - **Nombre del producto:** buscar entre los productos disponibles en la cuenta
  - **Oferta:** seleccionar la oferta correspondiente (por lo general hay una sola activa)

---

### Configuración de métodos de pago

- Se recomienda habilitar únicamente la opción de **PayPal**
- El resto de métodos de pago **no se recomienda habilitarlos** por defecto cuando se vende por política general
- **Excepción:** si se quiere que el cliente pueda pagar con métodos locales (ejemplo: en México o Colombia), se pueden habilitar los medios de pago locales correspondientes

---

### Configurar las etapas del embudo

- Hacer clic en la **flecha del embudo creado** y seleccionar **"Editar etapas"**
- Estructura recomendada del embudo:
  - **1 upsell**
  - **1 downsell**
- Pasos para configurar cada etapa:
  1. Hacer clic en **"Inicio"**
  2. Colocar el **nombre de la etapa** (ejemplo: `Upsell`)
  3. Seleccionar el **nombre del producto** correspondiente a esa etapa
  4. Seleccionar la **oferta** de ese producto

---

### Configuración de páginas y links

- Se recomienda tener un **archivo de referencia** con todos los links de las páginas ya listas, para simplemente **copiar y pegar** cada link en la etapa correspondiente
- Tipos de páginas a vincular en cada etapa:
  - Página que se muestra **al comprar** (página de oferta upsell/downsell)
  - Página de **confirmación de compra**

---

### Configuración del botón de acción

- Hotmart solicita el **texto del botón** que verá el cliente al recibir la oferta:
  - **Botón "Sí" (acepta la oferta):** colocar un texto relacionado al producto vendido
    - Ejemplo: algo alusivo al upsell que se está ofreciendo
    - Se recomienda un texto que motive a tomar acción
  - **Botón "No" (rechaza la oferta):** colocar un texto que refuerce la decisión de no comprar
    - Ejemplo: *"No quiero usar la verdad"* (texto orientado a que el rechazo tenga un costo psicológico)
- También existe la opción de **modificar el botón de compra** directamente desde la configuración de la etapa
- Se puede previsualizar cómo se verá el botón en la página antes de guardar

---

### Notas adicionales

- Si se crearon **varias ofertas** para un mismo producto en Hotmart, se pueden asignar ofertas distintas a distintas etapas del embudo
- La opción de **precificación/precios** dentro del producto en Hotmart permite agregar múltiples ofertas
- Avanzar con el botón **"Siguiente"** para confirmar cada etapa configurada