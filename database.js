const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

class DatabaseManager {
    constructor() {
        this.dataPath = config.dataPath;
        this.productsFile = path.join(this.dataPath, config.productsFile);
        this.stockFile = path.join(this.dataPath, config.stockFile);
        this.historyFile = path.join(this.dataPath, config.historyFile);
        
        this.init();
    }

    async init() {
        await fs.ensureDir(this.dataPath);
        
        // Inicializar archivos si no existen
        if (!await fs.pathExists(this.productsFile)) {
            await fs.writeJson(this.productsFile, {});
        }
        if (!await fs.pathExists(this.stockFile)) {
            await fs.writeJson(this.stockFile, {});
        }
        if (!await fs.pathExists(this.historyFile)) {
            await fs.writeJson(this.historyFile, []);
        }
    }

    // Productos
    async getProductos() {
        return await fs.readJson(this.productsFile);
    }

    async saveProductos(productos) {
        await fs.writeJson(this.productsFile, productos);
    }

    async agregarProducto(id, nombre, categoria, stockMinimo, receta = {}) {
        const productos = await this.getProductos();
        productos[id] = {
            nombre,
            categoria,
            stock_minimo: stockMinimo,
            receta
        };
        await this.saveProductos(productos);
        return true;
    }

    async eliminarProducto(id) {
        const productos = await this.getProductos();
        if (productos[id]) {
            delete productos[id];
            await this.saveProductos(productos);
            return true;
        }
        return false;
    }

    async modificarStockMinimo(id, nuevoStockMinimo) {
        const productos = await this.getProductos();
        if (productos[id]) {
            productos[id].stock_minimo = nuevoStockMinimo;
            await this.saveProductos(productos);
            return true;
        }
        return false;
    }

    // Stock
    async getStock() {
        return await fs.readJson(this.stockFile);
    }

    async saveStock(stock) {
        await fs.writeJson(this.stockFile, stock);
    }

    async actualizarStock(stockData) {
        await fs.writeJson(this.stockFile, stockData);
        return true;
    }

    // Historial
    async getHistorial() {
        return await fs.readJson(this.historyFile);
    }

    async agregarRegistroHistorial(registro) {
        const historial = await this.getHistorial();
        historial.unshift({
            ...registro,
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo los últimos 30 días
        if (historial.length > 30) {
            historial.splice(30);
        }
        
        await fs.writeJson(this.historyFile, historial);
        return true;
    }

    // Utilidades
    async getProductosPorCategoria(categoria) {
        const productos = await this.getProductos();
        const resultado = {};
        Object.keys(productos).forEach(id => {
            if (productos[id].categoria === categoria) {
                resultado[id] = productos[id];
            }
        });
        return resultado;
    }

    async calcularProduccionNecesaria() {
        const productos = await this.getProductos();
        const stock = await this.getStock();
        const produccion = {};

        Object.keys(productos).forEach(id => {
            const producto = productos[id];
            const stockActual = stock[id] || 0;
            const stockMinimo = producto.stock_minimo;
            
            if (stockActual < stockMinimo) {
                produccion[id] = {
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    cantidad: stockMinimo - stockActual,
                    stock_actual: stockActual,
                    stock_minimo: stockMinimo
                };
            }
        });

        return produccion;
    }

    async calcularIngredientesNecesarios(produccionData) {
        const productos = await this.getProductos();
        const ingredientesTotales = {};

        Object.keys(produccionData).forEach(id => {
            const producto = productos[id];
            const cantidad = produccionData[id].cantidad;
            const receta = producto.receta;

            Object.keys(receta).forEach(ingrediente => {
                const cantidadPorUnidad = receta[ingrediente];
                const total = cantidadPorUnidad * cantidad;

                if (!ingredientesTotales[ingrediente]) {
                    ingredientesTotales[ingrediente] = 0;
                }
                ingredientesTotales[ingrediente] += total;
            });
        });

        return ingredientesTotales;
    }
}

module.exports = DatabaseManager;
