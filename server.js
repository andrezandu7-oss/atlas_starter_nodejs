<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Sécurisé</title>
    <style>
        /* Base de l'application */
        body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-container { width: 100%; max-width: 450px; background: white; position: relative; display: flex; flex-direction: column; height: 100%; box-shadow: 0 0 20px rgba(0,0,0,0.1); }

        /* ÉCRAN 1 : ALERTE DE SÉCURITÉ (S'affiche en premier) */
        #security-layer { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: white; z-index: 10000; 
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
            padding: 40px; box-sizing: border-box; text-align: center;
        }
        .shield { font-size: 64px; margin-bottom: 20px; }
        .alert-h1 { font-size: 22px; font-weight: bold; color: #1a1a1a; margin-bottom: 15px; }
        .alert-p { font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 40px; }
        .btn-confirm { background: #3b71ca; color: white; border: none; padding: 16px; border-radius: 12px; font-size: 18px; font-weight: bold; width: 100%; cursor: pointer; transition: background 0.3s; }
        .btn-confirm:active { background: #2a5298; }

        /* ÉCRAN 2 : CHAT PROPREMENT DIT */
        .header { background: #a5c7f7; padding: 18px; color: white; text-align: center; font-weight: bold; font-size: 18px; }
        .sub-header { font-size: 12px; font-weight: normal; opacity: 0.9; margin-top: 2px; }
        
        .chat-content { flex: 1; padding: 20px; background: #fdfdfd; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; }
        .bubble { padding: 12px 16px; border-radius: 20px; font-size: 15px; line-height: 1.4; max-width: 85%; }
        .rec { background: #e8f0fe; align-self: flex-start; color: #1a1a1a; }
        .sen { background: #ff4766; color: white; align-self: flex-end; }

        /* ZONE DE SAISIE ET BOUTON ENVOI */
        .footer { padding: 15px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 10px; background: white; }
        .input-msg { flex: 1; background: #f0f2f5; border: none; padding: 12px 18px; border-radius: 25px; font-size: 15px; outline: none; }
        .btn-send { 
            width: 48px; height: 48px; background: #3b71ca; border-radius: 50%; 
            display: flex; justify-content: center; align-items: center; cursor: pointer; 
        }
        .arrow-icon {
            width: 0; height: 0; 
            border-top: 9px solid transparent; 
            border-bottom: 9px solid transparent; 
            border-left: 14px solid white; 
            transform: rotate(-15deg); /* Flèche horizontale vers le haut */
            margin-left: 4px;
        }
    </style>
</head>
<body>

<div class="app-container">
    <div id="security-layer">
        <div class="shield">🛡️</div>
        <div class="alert-h1">Espace de haute confidentialité</div>
        <p class="alert-p">
            Par mesure de sécurité, les <b>captures d'écran</b> sont désactivées et les messages sont <b>supprimés après 1h</b>.
        </p>
        <button class="btn-confirm" onclick="unlockChat()">Continuer</button>
    </div>

    <div class="header">
        📍 Chat sécurisé
        <div class="sub-header">Connecté via Genlove</div>
    </div>

    <div class="chat-content">
        <div class="bubble rec">Bonjour ! Je suis ravi(e) de faire ta connaissance. Ton profil correspond exactement à ce que je recherche. 👋</div>
        <div class="bubble sen">Bonjour ! Ravi(e) également. C'est rassurant de savoir que nous sommes compatibles. 😍</div>
    </div>

    <div class="footer">
        <input type="text" class="input-msg" placeholder="Écrivez votre message...">
        <div class="btn-send">
            <div class="arrow-icon"></div>
        </div>
    </div>
</div>

<script>
    // Assure l'affichage immédiat au chargement
    window.addEventListener('load', () => {
        document.getElementById('security-layer').style.display = 'flex';
    });

    // Fonction pour passer de l'alerte au chat
    function unlockChat() {
        const layer = document.getElementById('security-layer');
        layer.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        layer.style.opacity = "0";
        layer.style.transform = "scale(1.05)";
        setTimeout(() => {
            layer.style.display = 'none';
        }, 400);
    }
</script>

</body>
</html>
