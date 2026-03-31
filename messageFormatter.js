class MessageFormatter {
    // Formateo de mensajes para WhatsApp
    
    static menuPrincipal() {
        return `🥖 *Panadería Assistant*

📦 /stock - Registrar inventario completo
🧂 /stock salado - Solo productos salados  
🍰 /stock dulce - Solo productos dulces

📊 /produccion - Ver qué producir (todo)
🧂 /produccion salado - Solo salados
🍰 /produccion dulce - Solo dulces

🥘 /ingredientes - Calcular ingredientes (todo)
🧂 /ingredientes salado - Solo salados
🍰 /ingredientes dulce - Solo dulces

⚙️ /configurar - Gestionar productos
❓ /ayuda - Ver comandos`;
    }

    static configuracionInicial() {
        return `👋 ¡Hola! Soy tu asistente de inventario.

Para empezar, necesito configurar tus productos:

🧂 *CATEGORÍA SALADO:*
/nuevo salado [nombre] stock_minimo [cantidad]

🍰 *CATEGORÍA DULCE:*
/nuevo dulce [nombre] stock_minimo [cantidad]

📝 *Ejemplos:*
/nuevo salado baguette stock_minimo 20
/nuevo dulce pan_dulce stock_minimo 25

🥘 *Agregar recetas:*
/receta [producto] [ingrediente] [cantidad_por_unidad]

📝 *Ejemplo receta:*
/receta baguette harina 0.23kg
/receta baguette levadura 2.3g`;
    }

    static stockFormateado(stock, productos, categoria = null) {
        let mensaje = `📦 *Registro de inventario final*\n\n`;
        
        const productosCategoria = categoria ? 
            Object.keys(productos).filter(id => productos[id].categoria === categoria) :
            Object.keys(productos);

        if (categoria === 'salado' || !categoria) {
            const salados = productosCategoria.filter(id => productos[id].categoria === 'salado');
            if (salados.length > 0) {
                mensaje += `🧂 *PRODUCTOS SALADOS:*\n`;
                salados.forEach(id => {
                    const producto = productos[id];
                    const cantidad = stock[id] || 0;
                    mensaje += `• ${producto.nombre}: ${cantidad}\n`;
                });
                mensaje += `\n`;
            }
        }

        if (categoria === 'dulce' || !categoria) {
            const dulces = productosCategoria.filter(id => productos[id].categoria === 'dulce');
            if (dulces.length > 0) {
                mensaje += `🍰 *PRODUCTOS DULCES:*\n`;
                dulces.forEach(id => {
                    const producto = productos[id];
                    const cantidad = stock[id] || 0;
                    mensaje += `• ${producto.nombre}: ${cantidad}\n`;
                });
            }
        }

        return mensaje;
    }

    static produccionFormateada(produccion, categoria = null) {
        let mensaje = `📊 *Producción necesaria para mañana:*\n\n`;
        
        const produccionCategoria = categoria ?
            Object.keys(produccion).filter(id => produccion[id].categoria === categoria) :
            Object.keys(produccion);

        let totalSalados = 0;
        let totalDulces = 0;

        if (categoria === 'salado' || !categoria) {
            const salados = produccionCategoria.filter(id => produccion[id].categoria === 'salado');
            if (salados.length > 0) {
                mensaje += `🧂 *SALADOS:*\n`;
                salados.forEach(id => {
                    const item = produccion[id];
                    const emoji = item.categoria === 'salado' ? '🥖' : '🥐';
                    mensaje += `${emoji} ${item.nombre}: ${item.cantidad} unidades\n`;
                    mensaje += `   (Quedaron: ${item.stock_actual} | Mínimo: ${item.stock_minimo})\n\n`;
                    totalSalados += item.cantidad;
                });
            }
        }

        if (categoria === 'dulce' || !categoria) {
            const dulces = produccionCategoria.filter(id => produccion[id].categoria === 'dulce');
            if (dulces.length > 0) {
                mensaje += `🍰 *DULCES:*\n`;
                dulces.forEach(id => {
                    const item = produccion[id];
                    const emoji = item.categoria === 'dulce' ? '🍩' : '🍰';
                    mensaje += `${emoji} ${item.nombre}: ${item.cantidad} unidades\n`;
                    mensaje += `   (Quedaron: ${item.stock_actual} | Mínimo: ${item.stock_minimo})\n\n`;
                    totalDulces += item.cantidad;
                });
            }
        }

        if (!categoria) {
            mensaje += `📝 *Total salados: ${totalSalados} unidades*\n`;
            mensaje += `📝 *Total dulces: ${totalDulces} unidades*`;
        }

        return mensaje;
    }

    static ingredientesFormateados(ingredientes, produccion, categoria = null) {
        let mensaje = `🥘 *Ingredientes necesarios:*\n\n`;
        
        const produccionCategoria = categoria ?
            Object.keys(produccion).filter(id => produccion[id].categoria === categoria) :
            Object.keys(produccion);

        // Agrupar ingredientes por categoría
        const ingredientesPorCategoria = {
            salado: {},
            dulce: {}
        };

        Object.keys(produccion).forEach(id => {
            const item = produccion[id];
            if (!categoria || item.categoria === categoria) {
                ingredientesPorCategoria[item.categoria][id] = item;
            }
        });

        // Mostrar ingredientes por categoría
        if ((categoria === 'salado' || !categoria) && Object.keys(ingredientesPorCategoria.salado).length > 0) {
            mensaje += `🧂 *PARA PRODUCTOS SALADOS:*\n`;
            let detalleSalados = '';
            Object.keys(ingredientesPorCategoria.salado).forEach(id => {
                const item = ingredientesPorCategoria.salado[id];
                detalleSalados += `${item.nombre}: ${item.cantidad} unidades\n`;
            });
            mensaje += detalleSalados + '\n';
        }

        if ((categoria === 'dulce' || !categoria) && Object.keys(ingredientesPorCategoria.dulce).length > 0) {
            mensaje += `🍰 *PARA PRODUCTOS DULCES:*\n`;
            let detalleDulces = '';
            Object.keys(ingredientesPorCategoria.dulce).forEach(id => {
                const item = ingredientesPorCategoria.dulce[id];
                detalleDulces += `${item.nombre}: ${item.cantidad} unidades\n`;
            });
            mensaje += detalleDulces + '\n';
        }

        // Lista de compras total
        mensaje += `🛒 *LISTA DE COMPRAS TOTAL:*\n`;
        Object.keys(ingredientes).forEach(ingrediente => {
            const cantidad = ingredientes[ingrediente];
            const unidad = this.detectarUnidad(ingrediente, cantidad);
            mensaje += `• ${ingrediente}: ${cantidad}${unidad}\n`;
        });

        return mensaje;
    }

    static listaProductos(productos, categoria = null) {
        let mensaje = `📋 *Lista de productos configurados:*\n\n`;
        
        const productosFiltrados = categoria ?
            Object.keys(productos).filter(id => productos[id].categoria === categoria) :
            Object.keys(productos);

        productosFiltrados.forEach(id => {
            const producto = productos[id];
            const emoji = producto.categoria === 'salado' ? '🧂' : '🍰';
            mensaje += `${emoji} ${producto.nombre} | Stock mínimo: ${producto.stock_minimo}\n`;
        });

        return mensaje;
    }

    static detectarUnidad(ingrediente, cantidad) {
        if (ingrediente.includes('harina') || ingrediente.includes('azúcar') || ingrediente.includes('mantequilla')) {
            return ' kg';
        } else if (ingrediente.includes('agua') || ingrediente.includes('leche')) {
            return ' L';
        } else if (ingrediente.includes('levadura') || ingrediente.includes('sal')) {
            return ' g';
        } else if (ingrediente.includes('huevos')) {
            return cantidad === 1 ? ' unidad' : ' unidades';
        }
        return '';
    }

    static exito(mensaje) {
        return `✅ ${mensaje}`;
    }

    static error(mensaje) {
        return `❌ Error: ${mensaje}`;
    }

    static advertencia(mensaje) {
        return `⚠️ Advertencia: ${mensaje}`;
    }

    static informacion(mensaje) {
        return `ℹ️ ${mensaje}`;
    }
}

module.exports = MessageFormatter;
