# 🚀 Guía de Inicio Rápido

## ⚠️ PASO 1: Configurar tu número

Abre el archivo `config.js` y reemplaza:
```javascript
ownerNumber: "1234567890@c.us" // ← CAMBIA ESTE NÚMERO
```

Por tu número real:
```javascript
ownerNumber: "5215512345678@c.us" // Ejemplo para México
```

**Formato:** `[código_pais][número]@c.us`

## 🚀 PASO 2: Iniciar el bot

```bash
npm start
```

## 📱 PASO 3: Escanear QR

1. Se mostrará un código QR en la terminal
2. Abre WhatsApp Web en tu celular
3. Escanéa el código QR
4. ¡Listo para usar!

## 🧪 PASO 4: Probar comandos

Envía estos mensajes a tu propio número:

```
/ayuda
/productos
/produccion
/ingredientes
```

## 📊 Datos de ejemplo cargados

El bot ya tiene productos configurados:
- **Salados**: Baguette (stock: 5), Croissant (stock: 8)
- **Dulces**: Pan Dulce (stock: 12), Dona (stock: 6)

## 🔥 Comandos para probar

```
/stock → Ver inventario actual
/produccion → Ver qué falta producir
/ingredientes → Ver ingredientes necesarios
```

## ❓ ¿Problemas?

- **No responde**: Verifica que escaneaste el QR correctamente
- **Número incorrecto**: Revisa el formato en config.js
- **Error en terminal**: Revisa los mensajes de error

¡Listo para gestionar tu panadería! 🥖
