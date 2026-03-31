const express = require('express');
const DatabaseManager = require('./database');
const MessageFormatter = require('./messageFormatter');
const config = require('./config');

const app = express();
app.use(express.json());

// Base de datos
const db = new DatabaseManager();

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Bot de panadería corriendo',
        timestamp: new Date().toISOString(),
        owner: config.ownerNumber
    });
});

// WhatsApp webhook endpoint
app.post('/webhook', async (req, res) => {
    try {
        const { from, body } = req.body;
        
        // Verificar si es el dueño
        if (from !== config.ownerNumber) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        console.log(`📩 Mensaje del dueño: ${body}`);
        
        // Procesar comandos
        const response = await processCommand(body.toLowerCase().trim());
        
        res.json({ 
            message: response,
            to: from,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error procesando mensaje:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

async function processCommand(command) {
    const productos = await db.getProductos();
    const stock = await db.getStock();
    
    switch(command) {
        case '/ayuda':
        case '/start':
            return MessageFormatter.menuPrincipal();
            
        case '/productos':
            return MessageFormatter.listaProductos(productos);
            
        case '/stock':
            return MessageFormatter.stockFormateado(stock, productos);
            
        case '/produccion':
            const produccion = await db.calcularProduccionNecesaria();
            return MessageFormatter.produccionFormateada(produccion);
            
        case '/ingredientes':
            const ingredientes = await db.calcularIngredientesNecesarios(produccion);
            return MessageFormatter.ingredientesFormateados(ingredientes, produccion);
            
        default:
            if (command.startsWith('/agregar')) {
                return 'Para agregar productos, usa el formato: /agregar [categoria] [nombre] stock_minimo [cantidad]';
            }
            if (command.startsWith('/actualizar')) {
                return 'Para actualizar stock, usa: /actualizar [producto] [cantidad]';
            }
            return MessageFormatter.informacion('Comando no reconocido. Usa /ayuda para ver los comandos disponibles.');
    }
}

// Inicializar base de datos y servidor
async function start() {
    try {
        await db.init();
        console.log('✅ Base de datos inicializada');
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Bot corriendo en puerto ${PORT}`);
            console.log(`📱 Dueño configurado: ${config.ownerNumber}`);
        });
    } catch (error) {
        console.error('❌ Error iniciando el bot:', error);
        process.exit(1);
    }
}

start();
