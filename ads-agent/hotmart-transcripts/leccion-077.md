# Subir Ofertas Adicionales a Hotmart

### Estructura del Embudo de Ventas en Hotmart

---

### Componentes del Embudo de Ventas

Un embudo de ventas tiene dos fases principales: **Front-end** y **Back-end**.

---

### Front-end

El front-end contiene los productos que el cliente ve **antes** de completar la compra.

#### 1. Producto Principal
- Es el primer producto que las personas ven en el embudo de ventas
- Se presenta a través de la **página de ventas**
- El cliente decide comprarlo o no comprarlo desde esta página

#### 2. Order Bump
- Se coloca directamente en la **página de checkout**
- El cliente llega al checkout después de hacer clic en el botón de compra de la página de ventas
- En el checkout, el cliente ingresa sus datos personales: nombre, correo electrónico y método de pago
- En esa misma página se le presenta una **oferta adicional** (Order Bump)

**Ejemplo práctico:**
- Producto principal: *Mapa de la Cantidad Financiera* → precio: **$344**
- Order Bump: *20 Maneras de Generar $330* → precio: **$82**
- Total combinado si acepta ambos: **$220,22** (aproximado según la clase)

> Si el cliente hace clic en el segundo producto, este se suma automáticamente al resumen de la orden.

---

### Back-end

El back-end contiene los productos que se ofrecen **después** de que el cliente ya realizó el pago.

#### 1. Upsell (Obsel)
- Es el **primer producto ofrecido** luego de que el cliente completó el pago
- En lugar de ir a la página de gracias, el cliente es redirigido a la **página de upsell**
- Se presenta como un "paso número 2" para que el cliente sienta que aún no completó el proceso
- El cliente tiene dos opciones:
  - **Acepta** → puede ser llevado a otro upsell adicional o a la página de gracias
  - **No acepta** → es redirigido al downsell

#### 2. Downsell (Daunsel)
- Se ofrece cuando el cliente **rechaza el upsell**
- Es una oferta alternativa de menor valor o diferente al upsell
- El cliente tiene las mismas dos opciones: comprar o no comprar

#### 3. Página de Gracias
- Marca el **final del embudo**
- El cliente llega aquí luego de completar todas las decisiones de compra del back-end

---

### Estructura Completa del Embudo

```
[Anuncio]
    ↓
[Página de Ventas - Producto Principal]
    ↓
[Checkout + Order Bump]
    ↓ (cliente paga)
[Upsell 1]
    ├── Acepta → [Upsell 2] → [Página de Gracias]
    └── No acepta → [Downsell 1]
                        ├── Acepta → [Página de Gracias]
                        └── No acepta → [Página de Gracias]
```

---

### Consideraciones para Subir Ofertas a Hotmart

- El **producto principal ya debe estar subido y validado** en Hotmart antes de construir el embudo completo
- No se debe construir el embudo final sin haber validado primero el producto principal
- En un embudo básico es suficiente con tener:
  - Un **upsell**
  - Un **downsell**
- En embudos más avanzados se pueden tener múltiples upsells y downsells (el ejemplo de la clase muestra **dos upsells y dos downsells**)
- La configuración completa del embudo en Hotmart se desarrolla en el **siguiente video del curso**