<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Sécurisé - Test Final</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #000; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .phone-container { width: 375px; height: 667px; background: white; position: relative; display: flex; flex-direction: column; }

        /* L'ALERTE DE CONFIDENTIALITÉ (OVERLAY) */
        #security-layer { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: white; z-index: 10000; /* Toujours au-dessus */
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
            padding: 40px; box-sizing: border-box; text-align: center;
        }
        .icon-shield { font-size: 70px; margin-bottom: 25px; }
        .title { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 20px; }
        .description { font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 40px; }
        .btn-confirm { 
            background: #3b71ca; color: white; border: none; padding: 18px 0; 
            border-radius: 12px; font-size: 18px; font-weight: bold; width: 100%; cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 113, 202, 0.3);
        }

        /* INTERFACE DE CHAT (DERRIÈRE) */
        .header { background: #a5c7f7; padding: 15px; color: white; text-align: center; font-weight: bold; }
        .messages { flex: 1; padding: 15px; background: #f9f9f9; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px 16px; border-radius: 20px; font-size: 14px; max-width: 80%; }
        .rec { background: #e8f0fe; align-self: flex-start; }
        .sen { background: #ff4766; color: white; align-self: flex-end; }
        .input-bar { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
        .field { flex: 1; background: #f0f2f5; border: none; padding: 10px 15px; border-radius: 20px; }
        .send-btn { width: 45px; height: 45px; background: #3b71ca; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
        .arrow { width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 12px solid white; transform: rotate(-15deg); margin-left: 4px; }
    </style>
</head>
<body>

<div class="phone-container">
    <div id="security-layer">
        <div class="icon-shield">🛡️</div>
        <div class="title">Espace de haute confidentialité</div>
        <p class="description">
            Par mesure de sécurité, les <b>captures d'écran</b> sont désactivées et vos messages seront <b>effacés après 1h</b>.
        </p>
        <button class="btn-confirm" onclick="hideAlert()">Continuer</button>
    </div>

    <div class="header">📍 Chat sécurisé</div>
    <div class="messages">
        <div class="bubble rec">Bonjour ! Je suis ravi(e) de faire ta connaissance. Ton profil correspond exactement à ce que je recherche. 👋</div>
        <div class="bubble sen">Bonjour ! Ravi(e) également. C'est rassurant de savoir que nous sommes compatibles. 😍</div>
    </div>
    <div class="input-bar">
        <input type="text" class="field" placeholder="Écrivez votre message...">
        <div class="send-btn"><div class="arrow"></div></div>
    </div>
</div>

<script>
    // Force l'affichage au chargement
    window.onload = function() {
        document.getElementById('security-layer').style.display = 'flex';
    };

    function hideAlert() {
        document.getElementById('security-layer').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('security-layer').style.display = 'none';
        }, 400);
    }
</script>

</body>
</html>
                   
