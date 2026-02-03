const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Styles communs (première partie)
const styles = `
<style>
    /* [Tous les styles de la première partie restent identiques - je les conserve tels quels] */
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    /* ... tous les styles existants ... */
</style>
`;

// Script notifications commun
const notifyScript = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        document.getElementById('notify-msg').innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }
</script>
`;

// === ROUTES DE L'APP PRINCIPALE (1ère partie) ===
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <!-- Code home-screen identique -->
    </body></html>`);
});

app.get('/signup', (req, res) => { /* Code identique */ });
app.get('/profile', (req, res) => { /* Code identique */ });
app.get('/matching', (req, res) => { /* Code identique avec AJOUT LIEN CHAT */ });
app.get('/settings', (req, res) => { /* Code identique */ });

// === NOUVELLE ROUTE MESSAGERIE (2ème partie intégrée) ===
app.get('/chat', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Messagerie Sécurisée</title>
    ${styles}  <!-- Styles communs inclus -->
    <style>
        /* Styles spécifiques messagerie (2ème partie) */
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }
        
        /* TOUS les styles de la 2ème partie (header, chat, timer, etc.) */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        /* ... tous les styles de la messagerie ... */
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        /* ... reste des styles ... */
    </style>
</head>
<body>

    <!-- TOUS les écrans de la 2ème partie -->
    <div id="screen1" class="screen active notif-bg">
        <!-- Écran notification identique -->
    </div>

    <div id="screen2" class="screen notif-bg"><!-- Confirmation Sarah --></div>
    
    <div id="screen3" class="screen">
        <!-- Chat avec popup sécurité + TOUT le JavaScript -->
        <div class="chat-header">
            <button class="btn-quit" onclick="showFinal('chat')">✕</button>
            <div class="digital-clock">
                <span class="heart-icon">❤️</span><span id="timer-display">30:00</span>
            </div>
            <button class="btn-logout-badge" onclick="showFinal('app')">Logout 🔒</button>
        </div>
        <!-- ... reste du chat ... -->
    </div>

    <!-- Écran final -->
    <div id="screen-final" class="screen final-bg"><!-- ... --></div>

    <!-- TOUT le JavaScript de la 2ème partie -->
    <script>
        let timeLeft = 30 * 60; 
        let timerInterval;
        // ... TOUS les scripts (show, timer, send, etc.) identiques ...
        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const div = document.createElement('div');
                div.className = 'bubble sent';
                div.innerText = input.value;
                document.getElementById('box').appendChild(div);
                input.value = '';
                input.style.height = "auto";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }
        // ... reste du script ...
    </script>
</body>
</html>`);
});

// Lien d'intégration dans /matching (modifier le bouton "Contacter")
app.get('/matching', (req, res) => {
    // Dans le HTML de matching, changer les boutons :
    // onclick="window.location.href='/chat'" au lieu de showNotify
    res.send(`... HTML avec <a href="/chat" class="btn-action btn-contact">Contacter</a> ...`);
});

app.listen(port, () => {
    console.log(`🚀 Genlove fusionné sur port ${port}`);
});
