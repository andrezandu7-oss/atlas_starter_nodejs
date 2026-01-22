<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Sécurisé - Test Alerte</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; height: 100vh; }
        .phone-screen { width: 360px; background: white; border-radius: 20px; position: relative; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.2); }
        
        /* HEADER */
        .header { background: #a5c7f7; padding: 15px; text-align: center; color: white; font-weight: bold; }

        /* ÉCRAN D'ALERTE (Prioritaire) */
        #overlay { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: white; z-index: 999; /* Très haut pour être sûr qu'il couvre tout */
            display: flex; justify-content: center; align-items: center; 
        }
        .popup { width: 85%; padding: 25px; text-align: center; border: 1px solid #eee; border-radius: 15px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .popup h3 { margin-top: 0; font-size: 19px; color: #333; }
        .popup p { font-size: 14px; color: #555; margin: 15px 0; line-height: 1.5; }
        .btn-continue { background: #3b71ca; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; }

        /* ZONE DE CHAT */
        .chat-area { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .msg { padding: 12px 15px; border-radius: 18px; font-size: 14px; line-height: 1.4; max-width: 80%; }
        .received { background: #e8f0fe; align-self: flex-start; }
        .sent { background: #ff4766; color: white; align-self: flex-end; }

        /* INPUT */
        .input-zone { padding: 15px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #eee; }
        .input-field { flex: 1; background: #f0f2f5; border: none; padding: 10px 15px; border-radius: 20px; outline: none; }
        .send-btn { 
            width: 45px; height: 45px; background: #3b71ca; border-radius: 50%; 
            display: flex; justify-content: center; align-items: center;
        }
        .arrow {
            width: 0; height: 0;
            border-top: 8px solid transparent; border-bottom: 8px solid transparent;
            border-left: 12px solid white;
            transform: rotate(-15deg); /* Ta flèche orientée vers le haut */
            margin-left: 4px;
        }
    </style>
</head>
<body>

<div class="phone-screen">
    <div id="overlay">
        <div class="popup">
            <div style="font-size: 40px;">🛡️</div>
            <h3>Espace de haute confidentialité</h3>
            <p>Les captures d'écran sont désactivées.<br>Les messages s'effacent automatiquement après 1h.</p>
            <button class="btn-continue" onclick="document.getElementById('overlay').style.display='none'">Continuer</button>
        </div>
    </div>

    <div class="header">📍 Chat sécurisé</div>

    <div class="chat-area">
        <div class="msg received">Bonjour ! Je suis ravi(e) de faire ta connaissance. Ton profil correspond exactement à ce que je recherche. 👋</div>
        <div class="msg sent">Bonjour ! Ravi(e) également. C'est rassurant de savoir que nous sommes compatibles. 😍</div>
    </div>

    <div class="input-zone">
        <input type="text" class="input-field" placeholder="Écrivez votre message...">
        <div class="send-btn">
            <div class="arrow"></div>
        </div>
    </div>
</div>

</body>
</html>
            
