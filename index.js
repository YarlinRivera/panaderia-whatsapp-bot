const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const DatabaseManager = require('./database');
const MessageFormatter = require('./messageFormatter');
const config = require('./config');

class PanaderiaBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox']
            }
        });

        this.db = new DatabaseManager();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Evento QR
        this.client.on('qr', (qr) => {
            console.log('QR Code recibido, escanéalo con WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Evento autenticación
        this.client.on('authenticated', () => {
            console.log('✅ Autenticación exitosa');
        });

        // Evento auth failure
        this.client.on('auth_failure', msg => {
            console.error('❌ Error de autenticación:', msg);
        });

        // Evento ready
        this.client.on('ready', () => {
            console.log('✅ Bot de Panadería listo para usar!');
            console.log(`📱 Dueño configurado: ${config.ownerNumber}`);
            console.log('📱 Estado: Conectado y esperando mensajes...');
        });

        // Evento mensaje
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Evento desconexión
        this.client.on('disconnected', (reason) => {
            console.log('❌ Bot desconectado:', reason);
        });
    }

    async handleMessage(message) {
        const sender = message.from;
        const body = message.body.toLowerCase().trim();

        // Debug: mostrar todos los mensajes recibidos
        console.log(`📩 Mensaje recibido:`);
        console.log(`   De: ${sender}`);
        console.log(`   Dueño: ${config.ownerNumber}`);
        console.log(`   Contenido: ${body}`);
        console.log(`   ¿Es dueño?: ${sender === config.ownerNumber}`);

        // Verificar si es el dueño
        if (sender !== config.ownerNumber) {
            console.log(`❌ Mensaje ignorado - no es el dueño`);
            return;
        }

        console.log(`✅ Procesando mensaje del dueño: ${body}`);

        try {
            // Comandos principales
            if (body === '/ayuda' || body === '/start') {
                await message.reply(MessageFormatter.menuPrincipal());
            }
            else if (body === '/configurar') {
                await message.reply(MessageFormatter.configuracionInicial());
            }
            else if (body.startsWith('/nuevo')) {
                await this.handleNuevoProducto(message, body);
            }
            else if (body.startsWith('/receta')) {
                await this.handleAgregarReceta(message, body);
            }
            else if (body.startsWith('/stock')) {
                await this.handleStock(message, body);
            }
            else if (body.startsWith('/produccion')) {
                await this.handleProduccion(message, body);
            }
            else if (body.startsWith('/ingredientes')) {
                await this.handleIngredientes(message, body);
            }
            else if (body.startsWith('/modificar')) {
                await this.handleModificar(message, body);
            }
            else if (body.startsWith('/eliminar')) {
                await this.handleEliminar(message, body);
            }
            else if (body.startsWith('/productos') || body.startsWith('/categorias')) {
                await this.handleListarProductos(message, body);
            }
            else {
                await message.reply(MessageFormatter.informacion('Comando no reconocido. Usa /ayuda para ver los comandos disponibles.'));
            }
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
            await message.reply(MessageFormatter.error('Ocurrió un error al procesar tu solicitud.'));
        }
    }

    async handleNuevoProducto(message, body) {
        const partes = body.split(' ');
        
        if (partes.length < 5) {
            await message.reply(MessageFormatter.error('Formato incorrecto. Usa: /nuevo [categoria] [nombre] stock_minimo [cantidad]'));
            return;
        }

        const categoria = partes[1];
        const nombre = partes[2];
        const stockMinimo = parseInt(partes[4]);

        if (!['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        if (isNaN(stockMinimo) || stockMinimo <= 0) {
            await message.reply(MessageFormatter.error('Stock mínimo debe ser un número mayor a 0'));
            return;
        }

        const id = nombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        try {
            await this.db.agregarProducto(id, nombre, categoria, stockMinimo);
            await message.reply(MessageFormatter.exito(`Producto "${nombre}" agregado correctamente a la categoría ${categoria}`));
            await message.reply(MessageFormatter.informacion('Ahora puedes agregar su receta con /receta'));
        } catch (error) {
            await message.reply(MessageFormatter.error('No se pudo agregar el producto'));
        }
    }

    async handleAgregarReceta(message, body) {
        const partes = body.split(' ');
        
        if (partes.length < 4) {
            await message.reply(MessageFormatter.error('Formato incorrecto. Usa: /receta [producto] [ingrediente] [cantidad]'));
            return;
        }

        const producto = partes[1];
        const ingrediente = partes[2];
        const cantidad = parseFloat(partes[3]);

        const productos = await this.db.getProductos();
        const idProducto = producto.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (!productos[idProducto]) {
            await message.reply(MessageFormatter.error(`Producto "${producto}" no encontrado`));
            return;
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            await message.reply(MessageFormatter.error('Cantidad debe ser un número mayor a 0'));
            return;
        }

        productos[idProducto].receta[ingrediente] = cantidad;
        await this.db.saveProductos(productos);
        
        await message.reply(MessageFormatter.exito(`Receta actualizada: ${ingrediente} - ${cantidad} por unidad de ${producto}`));
    }

    async handleStock(message, body) {
        const partes = body.split(' ');
        const categoria = partes[1];

        if (categoria && !['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        const productos = await this.db.getProductos();
        const stock = await this.db.getStock();

        if (Object.keys(productos).length === 0) {
            await message.reply(MessageFormatter.advertencia('No hay productos configurados. Usa /configurar para empezar'));
            return;
        }

        // Si solo es "/stock", mostrar formato para registrar
        if (partes.length === 1) {
            await message.reply(MessageFormatter.stockFormateado(stock, productos, categoria || null));
            await message.reply(MessageFormatter.informacion('Para actualizar el stock, envíame las cantidades en formato:\n\n• Baguette: 5\n• Croissant: 8\n• Pan dulce: 12'));
            return;
        }

        // Aquí iría la lógica para procesar el stock enviado por el usuario
        await message.reply(MessageFormatter.informacion('Para registrar stock, envía las cantidades en el formato mostrado arriba'));
    }

    async handleProduccion(message, body) {
        const partes = body.split(' ');
        const categoria = partes[1];

        if (categoria && !['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        const produccion = await this.db.calcularProduccionNecesaria();
        
        if (Object.keys(produccion).length === 0) {
            await message.reply(MessageFormatter.exito('✅ Tienes stock suficiente para mañana'));
            return;
        }

        const mensaje = MessageFormatter.produccionFormateada(produccion, categoria || null);
        await message.reply(mensaje);
    }

    async handleIngredientes(message, body) {
        const partes = body.split(' ');
        const categoria = partes[1];

        if (categoria && !['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        const produccion = await this.db.calcularProduccionNecesaria();
        
        if (Object.keys(produccion).length === 0) {
            await message.reply(MessageFormatter.exito('No necesitas ingredientes, tienes stock suficiente'));
            return;
        }

        // Filtrar por categoría si se especifica
        let produccionFiltrada = produccion;
        if (categoria) {
            produccionFiltrada = {};
            Object.keys(produccion).forEach(id => {
                if (produccion[id].categoria === categoria) {
                    produccionFiltrada[id] = produccion[id];
                }
            });
        }

        const ingredientes = await this.db.calcularIngredientesNecesarios(produccionFiltrada);
        const mensaje = MessageFormatter.ingredientesFormateados(ingredientes, produccionFiltrada, categoria || null);
        await message.reply(mensaje);
    }

    async handleModificar(message, body) {
        const partes = body.split(' ');
        
        if (partes.length < 4) {
            await message.reply(MessageFormatter.error('Formato incorrecto. Usa: /modificar [producto] stock_minimo [nuevo_valor]'));
            return;
        }

        const producto = partes[1];
        const nuevoStockMinimo = parseInt(partes[3]);

        if (isNaN(nuevoStockMinimo) || nuevoStockMinimo <= 0) {
            await message.reply(MessageFormatter.error('Stock mínimo debe ser un número mayor a 0'));
            return;
        }

        const idProducto = producto.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        try {
            const exito = await this.db.modificarStockMinimo(idProducto, nuevoStockMinimo);
            if (exito) {
                await message.reply(MessageFormatter.exito(`Stock mínimo de "${producto}" actualizado a ${nuevoStockMinimo}`));
            } else {
                await message.reply(MessageFormatter.error(`Producto "${producto}" no encontrado`));
            }
        } catch (error) {
            await message.reply(MessageFormatter.error('No se pudo modificar el producto'));
        }
    }

    async handleEliminar(message, body) {
        const partes = body.split(' ');
        
        if (partes.length < 3) {
            await message.reply(MessageFormatter.error('Formato incorrecto. Usa: /eliminar [categoria] [producto]'));
            return;
        }

        const categoria = partes[1];
        const producto = partes[2];

        if (!['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        const idProducto = producto.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        try {
            const productos = await this.db.getProductos();
            if (productos[idProducto] && productos[idProducto].categoria === categoria) {
                const exito = await this.db.eliminarProducto(idProducto);
                if (exito) {
                    await message.reply(MessageFormatter.exito(`Producto "${producto}" eliminado correctamente`));
                } else {
                    await message.reply(MessageFormatter.error('No se pudo eliminar el producto'));
                }
            } else {
                await message.reply(MessageFormatter.error(`Producto "${producto}" no encontrado en la categoría ${categoria}`));
            }
        } catch (error) {
            await message.reply(MessageFormatter.error('No se pudo eliminar el producto'));
        }
    }

    async handleListarProductos(message, body) {
        const partes = body.split(' ');
        const categoria = partes[1];

        if (categoria && !['salado', 'dulce'].includes(categoria)) {
            await message.reply(MessageFormatter.error('Categoría inválida. Usa "salado" o "dulce"'));
            return;
        }

        const productos = await this.db.getProductos();
        
        if (Object.keys(productos).length === 0) {
            await message.reply(MessageFormatter.advertencia('No hay productos configurados'));
            return;
        }

        const mensaje = MessageFormatter.listaProductos(productos, categoria || null);
        await message.reply(mensaje);
    }

    start() {
        this.client.initialize();
    }
}

// Iniciar el bot
const bot = new PanaderiaBot();
bot.start();
