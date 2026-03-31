# 🥖 Bot de WhatsApp para Panadería

Bot automatizado para gestión de inventario de panadería a través de WhatsApp, diseñado específicamente para que el dueño controle el stock final del día y calcule automáticamente la producción e ingredientes necesarios.

## 🚀 Características Principales

- **Gestión por categorías**: Separación entre productos salados y dulces
- **Cálculo automático**: Determina qué producir basado en stock mínimo
- **Ingredientes inteligentes**: Calcula automáticamente los ingredientes necesarios
- **Interface WhatsApp**: Fácil de usar desde el celular
- **Historial**: Registro diario de inventario y producción

## 📋 Comandos del Bot

### Configuración
```
/configurar           → Muestra guía de configuración inicial
/nuevo salado [nombre] stock_minimo [cantidad]     → Agregar producto salado
/nuevo dulce [nombre] stock_minimo [cantidad]      → Agregar producto dulce
/receta [producto] [ingrediente] [cantidad]        → Agregar ingrediente a receta
```

### Gestión Diaria
```
/stock                → Ver/Registrar inventario completo
/stock salado         → Ver/Registrar solo productos salados
/stock dulce          → Ver/Registrar solo productos dulces
/produccion           → Ver qué producir mañana
/produccion salado    → Ver producción solo de salados
/produccion dulce     → Ver producción solo de dulces
/ingredientes         → Calcular ingredientes necesarios
/ingredientes salado  → Ingredientes solo para salados
/ingredientes dulce   → Ingredientes solo para dulces
```

### Administración
```
/productos            → Lista todos los productos
/productos salado     → Lista productos salados
/productos dulce      → Lista productos dulces
/modificar [producto] stock_minimo [nuevo_valor] → Cambiar stock mínimo
/eliminar salado [producto] → Eliminar producto salado
/eliminar dulce [producto]  → Eliminar producto dulce
/ayuda                → Menú principal de comandos
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js 14 o superior
- WhatsApp Web en tu celular

### Pasos de instalación

1. **Clonar o descargar el proyecto**
2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar el número del dueño**
   - Abrir el archivo `config.js`
   - Reemplazar `"1234567890@c.us"` con tu número de WhatsApp (incluyendo código de país)

4. **Iniciar el bot**
```bash
npm start
```

5. **Escanear el código QR**
   - Se mostrará un código QR en la terminal
   - Escanéalo con WhatsApp Web en tu celular
   - Listo para usar!

## 📱 Flujo de Trabajo

### 1. Configuración inicial (una sola vez)
```
/configurar
/nuevo salado baguette stock_minimo 20
/nuevo dulce pan_dulce stock_minimo 25
/receta baguette harina 0.23kg
/receta baguette levadura 2.3g
```

### 2. Uso diario
```
/stock
→ Ingresa cantidades finales
/produccion
→ Ve qué necesitas hacer
/ingredientes
→ Obtén lista de compras
```

## 📁 Estructura del Proyecto

```
panaderia-whatsapp-bot/
├── index.js              → Archivo principal del bot
├── database.js           → Gestión de base de datos
├── messageFormatter.js   → Formateo de mensajes
├── config.js            → Configuración del bot
├── package.json         → Dependencias del proyecto
├── data/                → Directorio de datos (creado automáticamente)
│   ├── productos.json   → Productos y recetas
│   ├── stock.json       → Stock actual
│   └── historial.json   → Historial de registros
└── README.md           → Este archivo
```

## 💡 Ejemplos de Uso

### Configurar productos
```
/nuevo salado baguette stock_minimo 20
/nuevo salado croissant stock_minimo 15
/nuevo dulce dona stock_minimo 10
/nuevo dulce pan_dulce stock_minimo 25
```

### Agregar recetas
```
/receta baguette harina 0.23kg
/receta baguette levadura 2.3g
/receta baguette agua 0.08L
/receta baguette sal 2.3g

/receta dona harina 0.15kg
/receta dona azucar 0.08kg
/receta dona huevos 1
```

### Registro diario
```
/stock
📦 Registro de inventario final

🧂 PRODUCTOS SALADOS:
• Baguette: 5
• Croissant: 8

🍰 PRODUCTOS DULCES:
• Dona: 6
• Pan dulce: 12
```

### Ver producción
```
/produccion
📊 Producción necesaria para mañana:

🧂 SALADOS:
🥖 Baguette: 15 unidades
🥐 Croissant: 7 unidades

🍰 DULCES:
🍩 Dona: 4 unidades
```

### Calcular ingredientes
```
/ingredientes
🥘 Ingredientes necesarios:

🛒 LISTA DE COMPRAS TOTAL:
• Harina: 4.71 kg
• Levadura: 47.1 g
• Agua: 1.62 L
• Azúcar: 0.32 kg
```

## 🔧 Personalización

### Cambiar número del dueño
Edita `config.js`:
```javascript
ownerNumber: "5211234567890@c.us", // Tu número con código de país
```

### Modificar comandos
Puedes personalizar los comandos en `index.js` en la función `handleMessage`.

### Agregar nuevas funcionalidades
El bot está diseñado para ser fácilmente extensible con nuevos comandos y características.

## 🚨 Notas Importantes

- **Solo el dueño puede usar el bot**: Configurado para responder solo al número especificado
- **Respaldos automáticos**: Los datos se guardan localmente en la carpeta `data/`
- **Formato de ingredientes**: Usa kg, g, L, unidades según corresponda
- **Historial limitado**: Se guardan los últimos 30 días de registros

## 📞 Soporte

Si tienes problemas o necesitas ayuda:
1. Revisa que Node.js esté actualizado
2. Verifica el número de teléfono en `config.js`
3. Asegúrate de escanear el QR correctamente
4. Revisa los logs en la terminal para errores

## 🔄 Actualizaciones Futuras

- Reportes semanales/mensuales
- Sugerencias automáticas de stock mínimo
- Exportación de datos a Excel
- Integración con proveedores
- Notificaciones automáticas

---

🥖 *Hecho con ❤️ para panaderías*
