// Configuración del bot
const config = {
    // Número de teléfono del dueño (con código de país)
    // IMPORTANTE: Reemplaza este número con tu número real de WhatsApp
    // Formato: [código_pais][número]@c.us
    // Ejemplo: 5215512345678@c.us (para México)
    ownerNumber: "573005260928@c.us", // ← CAMBIA ESTE NÚMERO
    
    // Configuración de archivos
    dataPath: "./data",
    productsFile: "productos.json",
    stockFile: "stock.json",
    historyFile: "historial.json"
};

module.exports = config;
