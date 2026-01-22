<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interface Chat Sécurisé - Test</title>
    <style>
        /* Style Global */
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .app-container { width: 375px; height: 667px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; overflow: hidden; display: flex; flex-direction: column; }

        /* ÉCRAN 1 : POPUP D'ALERTE (S'affiche en premier) */
        #safety-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 100; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 30px; box-sizing: border-box; }
        .shield-icon { font-size: 60px; margin-bottom: 20px; }
        .safety-title { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 15px; }
        .safety-text { font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 30px; }
        .btn-continue { background: #3b71ca; color: white; border: none; padding: 15px 40px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
        .btn-continue:active { transform: scale(0.95); }

        /* ÉCRAN 2 : INTERFACE DE CHAT */
        .header { background: #a5c7f7; padding: 15px; text-align: center; color: white; font-weight: bold; font-size: 18px; }
        .chat-messages { flex: 1; padding: 20px; background: #fdfdfd; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .bubble { padding: 12px 16px; border-radius: 18px; font-size: 14px; max-width: 85%; line-height: 1.4; }
        .received { background: #f1f3f4; align-self: flex-start; border-bottom-left-radius: 4px; }
        .sent { background: #ff4766; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ok-bubble { align-self: flex-end; background: #ff4766; color: white; padding: 8px 15px; border-radius: 15px; font-size: 13px; margin-top: -5px; }

        /* Barre d'envoi avec ta flèche spécifique */
        .input-bar { padding: 15px; display: flex; align-items: center; gap: 12px; border-top: 1px solid #eee; background: white; }
        .input-box { flex: 1; background: #f0f2f5; border: none; padding: 12px 18px; border-radius: 25px; font-size: 15px; outline: none; }
        .send-button { 
            width: 48px; height: 48px; background: #3b71ca; border-radius: 50%; 
            display: flex; justify-content: center; align-items: center; cursor: pointer;
        }
        .arrow {
            width: 0; height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-left: 14px solid white;
            /* L'inclinaison horizontale vers le haut demandée */
            transform: rotate(-15deg); 
            margin-left: 4px;
        }
    </style>
</head>
<body>

<div class="app-container">
    <div id="safety-screen">
        <div class="shield-icon">🛡️</div>
        <div class="safety-title">Espace de haute confidentialité</div>
        <p class="safety-text">
            Les captures d'écran sont désactivées.<br>
            Les messages s'effacent automatiquement après 1h.
        </p>
        <button class="btn-continue" onclick="startChat()">Continuer</button>
    </div>

    <div class="header">📍 Chat sécurisé</div>
    
    <div class="chat-messages">
        <div class="bubble received">Bonjour ! Je suis ravi(e) de faire ta connaissance. 👋</div>
        <div class="bubble sent">Bonjour ! Ravi(e) également. Ton profil m'a beaucoup plu. 😍</div>
        <div class="ok-bubble">Ok</div>
    </div>

    <div class="input-bar">
        <input type="text" class="input-box" placeholder="Message...">
        <div class="send-button">
            <div class="arrow"></div>
        </div>
    </div>
</div>

<script>
    function startChat() {
        // Cache l'écran d'alerte avec une petite animation de fondu
        const screen = document.getElementById('safety-screen');
        screen.style.transition = 'opacity 0.5s ease';
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.style.display = 'none';
        }, 500);
    }
</script>

</body>
</html>
            
