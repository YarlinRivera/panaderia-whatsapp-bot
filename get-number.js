const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Script para obtener tu número de WhatsApp real
async function getMyNumber() {
    console.log('🔍 Obteniendo tu número de WhatsApp...');
    
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('📱 Escanea este QR con WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('✅ Conectado a WhatsApp');
        
        // Obtener información del usuario
        client.getContacts().then(contacts => {
            const me = contacts.find(contact => contact.isMe);
            if (me) {
                console.log('📞 Tu número de WhatsApp es:');
                console.log(`   ID: ${me.id._serialized}`);
                console.log(`   Número: ${me.number}`);
                console.log(`   Nombre: ${me.name || me.pushname || 'Sin nombre'}`);
                
                // Formato para config.js
                console.log('\n🔧 Copia esto en tu config.js:');
                console.log(`ownerNumber: "${me.id._serialized}"`);
            } else {
                console.log('❌ No se pudo encontrar tu información');
            }
            
            setTimeout(() => {
                client.destroy();
                process.exit(0);
            }, 5000);
        });
    });

    client.initialize();
}

getMyNumber().catch(console.error);
