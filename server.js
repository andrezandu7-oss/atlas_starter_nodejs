const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- PAGE D'ACCUEIL (DESIGN IMAGE 37598) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - L'amour qui soigne</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
            h1 { font-size: 2.5rem; margin: 0; }
            .slogan { font-size: 1.2rem; margin-bottom: 20px; opacity: 0.9; }
            .quote { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; font-style: italic; line-height: 1.5; margin-bottom: 30px; font-size: 0.9rem; }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; transition: 0.3s; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <div class="slogan">L’amour qui soigne 💙</div>
            <div class="quote">"L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"</div>
            
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- PAGE POUR LES ANCIENS (TABLEAU DE BORD) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <body style="font-family: sans-serif; text-align:center; padding:50px;">
        <h1>Bonjour ! 👋</h1>
        <p>Heureux de vous revoir sur votre espace Genlove.</p>
        <div style="color: green; font-weight: bold;">Score de Confiance : 100% ✅</div>
        <br><a href="/">Retour à l'accueil</a>
    </body>
    `);
});

// --- PAGE POUR LES NOUVEAUX (FORMULAIRE 60%) ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 20px; display: flex; justify-content: center; }
            .container { background: white; padding: 25px; border-radius: 20px; width: 100%; max-width: 450px; }
            .fill { background: #4caf50; height: 10px; width: 60%; border-radius: 10px; }
            .upload-btn { border: 2px dashed #ff416c; padding: 15px; text-align: center; border-radius: 15px; margin: 10px 0; color: #ff416c; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color:#ff416c; text-align:center;">Nouveau Profil</h2>
            <div style="background:#eee; height:10px; border-radius:10px;"><div class="fill"></div></div>
            <p style="text-align:center; color:#4caf50; font-weight:bold;">Score : 60%</p>
            <form action="/dashboard" method="GET">
                <input type="text" placeholder="Nom complet" style="width:100%; padding:10px; margin:5px 0;" required>
                <select style="width:100%; padding:10px; margin:5px 0;"><option>AA</option><option>AS</option><option>SS</option></select>
                <div class="upload-btn">📸 Ajouter ma photo</div>
                <div class="upload-btn">📄 Certificat médical</div>
                <div class="upload-btn" style="border-color:#2196F3; color:#2196F3;">🎥 Vidéo de vérification</div>
                <button type="submit" style="background:#ff416c; color:white; border:none; width:100%; padding:15px; border-radius:50px; font-weight:bold; margin-top:20px; cursor:pointer;">🚀 Créer mon compte</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove prêt'); });
