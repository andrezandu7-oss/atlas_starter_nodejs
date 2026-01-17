// --- PAGE D'ACCUEIL : RETOUR AU DESIGN VALIDÉ ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - Accueil</title>
        <style>
            body { 
                font-family: 'Segoe UI', sans-serif; 
                background: linear-gradient(135deg, #ff416c, #ff4b2b); 
                height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; 
            }
            /* La carte blanche semi-transparente qui manquait */
            .card { 
                background: rgba(255, 255, 255, 0.2); 
                backdrop-filter: blur(15px); 
                padding: 40px 30px; 
                border-radius: 30px; 
                width: 85%; 
                max-width: 400px; 
                border: 1px solid rgba(255,255,255,0.3); 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 { font-size: 2.8rem; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
            .tagline { font-size: 1rem; margin: 15px 0 10px; opacity: 0.9; }
            .mission { font-weight: bold; margin-bottom: 35px; font-size: 1.1rem; line-height: 1.4; }
            .btn { 
                display: block; width: 100%; padding: 16px; margin: 12px 0; 
                border-radius: 50px; border: none; font-weight: bold; 
                cursor: pointer; text-decoration: none; font-size: 1.1rem; transition: 0.3s; 
            }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p class="tagline">"L'amour qui prend soin de votre avenir."</p>
            <p class="mission">Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
            
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup" class="btn btn-signup">📝 S'inscrire</a>
        </div>
    </body>
    </html>
    `);
});
