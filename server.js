const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('TEST REUSSI : Le code fonctionne !'));
app.listen(process.env.PORT || 3000, () => console.log('🚀 Serveur de test actif'));
