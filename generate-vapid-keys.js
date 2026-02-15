// generate-vapid-keys.js
const webPush = require('web-push');

// Générer les clés VAPID
const vapidKeys = webPush.generateVAPIDKeys();

console.log('\n=== CLÉS VAPID GÉNÉRÉES ===\n');
console.log('Ajoutez ces lignes à votre fichier .env :\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_EMAIL=mailto:contact@genlove.com\n');
console.log('⚠️  Gardez ces clés secrètes ! Ne les partagez jamais.\n');