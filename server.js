const express = require('express');
const app = express();
const port = 3000;

// Styles CSS
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Roboto, sans-serif;
        background: #fdf2f2;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }
    .app-shell {
        width: 100%;
        max-width: 420px;
        min-height: 100vh;
        background: #f4e9da;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 30px rgba(0,0,0,0.1);
        margin: 0 auto;
    }
    .home-screen {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
    }
    .logo-container {
        width: 280px;
        height: 280px;
        margin: 0 auto 20px;
    }
    .logo-text {
        font-size: 3rem;
        font-weight: 800;
        margin: 10px 0 20px;
        letter-spacing: -1px;
    }
    .slogan {
        font-weight: 500;
        color: #1a2a44;
        margin: 10px 25px 30px;
        font-size: 1.2rem;
        line-height: 1.5;
    }
    .btn-dark, .btn-pink {
        padding: 15px 25px;
        border-radius: 60px;
        font-size: 1.2rem;
        font-weight: 600;
        width: 90%;
        margin: 10px auto;
        display: block;
        text-align: center;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: all 0.3s;
    }
    .btn-pink {
        background: #ff416c;
        color: white;
    }
    .btn-dark {
        background: #1a2a44;
        color: white;
    }
    .btn-pink:hover, .btn-dark:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(255,65,108,0.4);
    }
</style>
`;

// Page d'accueil
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Accueil</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <!-- LOGO AVEC VRAIE DOUBLE HÉLICE D'ADN -->
            <div class="logo-container">
                <svg viewBox="0 0 300 300" style="width: 100%; height: 100%;">
                    <!-- Arrière-plan : Grand cœur rose -->
                    <path d="M150 250 L60 140 C30 90 60 30 110 30 C130 30 145 50 150 60 C155 50 170 30 190 30 C240 30 270 90 240 140 L150 250" 
                          fill="#FF69B4" opacity="0.8" stroke="#333" stroke-width="2"/>
                    
                    <!-- DOUBLE HÉLICE D'ADN - Forme en spirale -->
                    <!-- Brin bleu (premier brin) -->
                    <path d="M70 70 Q85 55, 100 70 T130 70 T160 70 T190 70" 
                          stroke="#4169E1" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M70 100 Q85 115, 100 100 T130 100 T160 100 T190 100" 
                          stroke="#4169E1" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M70 130 Q85 115, 100 130 T130 130 T160 130 T190 130" 
                          stroke="#4169E1" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M70 160 Q85 175, 100 160 T130 160 T160 160 T190 160" 
                          stroke="#4169E1" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M70 190 Q85 175, 100 190 T130 190 T160 190 T190 190" 
                          stroke="#4169E1" stroke-width="4" fill="none" stroke-linecap="round"/>
                    
                    <!-- Brin vert (deuxième brin) -->
                    <path d="M80 70 Q95 85, 110 70 T140 70 T170 70" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M110 70 Q125 55, 140 70 T170 70" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M80 100 Q95 115, 110 100 T140 100 T170 100" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M110 100 Q125 85, 140 100 T170 100" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M80 130 Q95 115, 110 130 T140 130 T170 130" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M110 130 Q125 145, 140 130 T170 130" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M80 160 Q95 175, 110 160 T140 160 T170 160" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M110 160 Q125 145, 140 160 T170 160" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M80 190 Q95 175, 110 190 T140 190 T170 190" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M110 190 Q125 205, 140 190 T170 190" 
                          stroke="#32CD32" stroke-width="4" fill="none" stroke-linecap="round"/>
                    
                    <!-- Barreaux multicolores (liaisons) -->
                    <line x1="75" y1="70" x2="85" y2="70" stroke="#FF4444" stroke-width="3"/>
                    <line x1="105" y1="70" x2="115" y2="70" stroke="#FFD700" stroke-width="3"/>
                    <line x1="135" y1="70" x2="145" y2="70" stroke="#FFA500" stroke-width="3"/>
                    <line x1="165" y1="70" x2="175" y2="70" stroke="#9932CC" stroke-width="3"/>
                    
                    <line x1="80" y1="85" x2="90" y2="95" stroke="#FFD700" stroke-width="3"/>
                    <line x1="110" y1="85" x2="120" y2="95" stroke="#FF4444" stroke-width="3"/>
                    <line x1="140" y1="85" x2="150" y2="95" stroke="#9932CC" stroke-width="3"/>
                    <line x1="170" y1="85" x2="180" y2="95" stroke="#FFA500" stroke-width="3"/>
                    
                    <line x1="75" y1="110" x2="85" y2="110" stroke="#FFA500" stroke-width="3"/>
                    <line x1="105" y1="110" x2="115" y2="110" stroke="#9932CC" stroke-width="3"/>
                    <line x1="135" y1="110" x2="145" y2="110" stroke="#FF4444" stroke-width="3"/>
                    <line x1="165" y1="110" x2="175" y2="110" stroke="#FFD700" stroke-width="3"/>
                    
                    <line x1="80" y1="125" x2="90" y2="135" stroke="#9932CC" stroke-width="3"/>
                    <line x1="110" y1="125" x2="120" y2="135" stroke="#FFA500" stroke-width="3"/>
                    <line x1="140" y1="125" x2="150" y2="135" stroke="#FFD700" stroke-width="3"/>
                    <line x1="170" y1="125" x2="180" y2="135" stroke="#FF4444" stroke-width="3"/>
                    
                    <line x1="75" y1="150" x2="85" y2="150" stroke="#FF4444" stroke-width="3"/>
                    <line x1="105" y1="150" x2="115" y2="150" stroke="#FFD700" stroke-width="3"/>
                    <line x1="135" y1="150" x2="145" y2="150" stroke="#FFA500" stroke-width="3"/>
                    <line x1="165" y1="150" x2="175" y2="150" stroke="#9932CC" stroke-width="3"/>
                    
                    <line x1="80" y1="165" x2="90" y2="175" stroke="#FFD700" stroke-width="3"/>
                    <line x1="110" y1="165" x2="120" y2="175" stroke="#FF4444" stroke-width="3"/>
                    <line x1="140" y1="165" x2="150" y2="175" stroke="#9932CC" stroke-width="3"/>
                    <line x1="170" y1="165" x2="180" y2="175" stroke="#FFA500" stroke-width="3"/>
                    
                    <line x1="75" y1="190" x2="85" y2="190" stroke="#FFA500" stroke-width="3"/>
                    <line x1="105" y1="190" x2="115" y2="190" stroke="#9932CC" stroke-width="3"/>
                    <line x1="135" y1="190" x2="145" y2="190" stroke="#FF4444" stroke-width="3"/>
                    <line x1="165" y1="190" x2="175" y2="190" stroke="#FFD700" stroke-width="3"/>
                    
                    <!-- LOUPE BLANCHE À DROITE -->
                    <circle cx="230" cy="120" r="35" fill="white" stroke="#333" stroke-width="3"/>
                    <rect x="255" y="140" width="30" height="12" rx="6" fill="white" stroke="#333" stroke-width="2" transform="rotate(35, 270, 146)"/>
                    
                    <!-- ÉTOILE DANS LA LOUPE -->
                    <circle cx="230" cy="120" r="12" fill="#FFD700" opacity="0.9"/>
                    <line x1="230" y1="100" x2="230" y2="110" stroke="#FFD700" stroke-width="3"/>
                    <line x1="230" y1="130" x2="230" y2="140" stroke="#FFD700" stroke-width="3"/>
                    <line x1="215" y1="120" x2="225" y2="120" stroke="#FFD700" stroke-width="3"/>
                    <line x1="235" y1="120" x2="245" y2="120" stroke="#FFD700" stroke-width="3"/>
                    <line x1="220" y1="105" x2="227" y2="112" stroke="#FFD700" stroke-width="3"/>
                    <line x1="233" y1="128" x2="240" y2="135" stroke="#FFD700" stroke-width="3"/>
                    <line x1="220" y1="135" x2="227" y2="128" stroke="#FFD700" stroke-width="3"/>
                    <line x1="233" y1="105" x2="240" y2="112" stroke="#FFD700" stroke-width="3"/>
                    <circle cx="230" cy="120" r="4" fill="white"/>
                </svg>
            </div>
            
            <!-- Texte Genlove -->
            <div class="logo-text">
                <span style="color:#1a2a44;">Gen</span><span style="color:#FF69B4;">love</span>
            </div>
            
            <!-- Slogan -->
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div>
            
            <!-- Boutons -->
            <div style="font-size:1.1rem; color:#1a2a44; margin:20px 0 10px;">Avez-vous déjà un compte ?</div>
            <a href="#" class="btn-dark" onclick="alert('Page de connexion')">Se connecter</a>
            <a href="#" class="btn-pink" onclick="alert('Page de création de compte')">Créer un compte</a>
            <div style="margin-top:30px; font-size:0.9rem; color:#666;">🛡️ Vos données de santé sont cryptées</div>
        </div>
    </div>
</body>
</html>`);
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});