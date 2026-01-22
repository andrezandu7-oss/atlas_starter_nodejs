<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Sécurisé - Version Finale</title>
    <style>
        /* Style Global */
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .phone-screen { width: 100%; max-width: 400px; background: white; position: relative; display: flex; flex-direction: column; height: 100%; }

        /* ÉCRAN 1 : L'ALERTE DE CONFIDENTIALITÉ (OVERLAY) */
        #security-overlay { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: white; z-index: 10000; 
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
            padding: 30px; box-sizing: border-box; text-align: center;
        }
        .shield-icon { font-size: 60px; margin-bottom: 20px; }
        .alert-title { font-size: 22px; font-weight: bold; color: #1a1a1a; margin-bottom: 15px; }
        .alert-desc { font-size: 15px; color: #555; line-height: 1.5; margin-bottom: 35px; }
        .btn-continue { background: #3b71ca; color: white; border: none; padding: 15px 0; border-radius: 10px; font-size: 17px; font-weight: bold; width: 100%; cursor: pointer; }

        /* ÉCRAN 2 : LE CHAT */
        .header { background: #a5c7f7; padding: 15px; text-align: center; color: white; font-weight: bold; font-size: 18px; }
        .chat-area { flex: 1; padding: 15px; background: #fdfdfd; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .msg { padding: 12px 16px; border-radius: 20px; font-size: 14px; max-width: 80%; line-height: 1.4; }
        .received { background: #e8f0fe; align-self: flex-start; color: #333; }
        .sent { background: #ff4766; color: white; align-self: flex-end; }

        /* BARRE D'ENVOI AVEC TA FLÈCHE CORRIGÉE */
        .input-zone { padding: 12px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #eee; background: white; }
        .input-box { flex: 1; background: #f0f2f5; border: none; padding: 10px 15px; border-radius: 20px; outline: none; }
        .send-btn { width: 45px; height: 45px; background: #3b71ca; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
        .arrow-up-right { 
            width: 0; height: 0; 
            border-top: 8px solid transparent; 
            border-bottom: 8px solid transparent; 
            border-left: 13px solid white; 
            transform: rotate(-15deg); /* Ta flèche horizontale orientée vers le haut */
            margin-left: 4px;
        }
    </style>
</head>
<body>

<div class="phone-screen">
    <div id="security-overlay">
        <div class="shield-icon">🛡️</div>
        <div class="alert-title">Espace de haute confidentialité</div>
        <p class="alert-desc">
            Pour votre sécurité, les <b>captures d'écran</b> sont bloquées et les messages seront <b>effacés après 1h</b>.
        </p>
        <button class="btn-continue" onclick="acceptSecurity()">Continuer</button>
    </div>

    <div class="header">📍 Chat sécurisé</div>
    
    <div class="chat-area">
        <div class="msg received">Bonjour ! Je suis ravi(e) de faire ta connaissance. Ton profil correspond exactement à ce que je recherche. 👋</div>
        <div class="msg sent">Bonjour ! Ravi(e) également. C'est rassurant de savoir que nous sommes compatibles. 😍</div>
    </div>

    <div class="input-zone">
        <input type="text" class="input-box" placeholder="Écrivez votre message...">
        <div class="send-btn">
            <div class="arrow-up-right"></div>
        </div>
    </div>
</div>

<script>
    // Force l'affichage du popup dès que le code est chargé
    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById('security-overlay').style.display = 'flex';
    });

    function acceptSecurity() {
        const overlay = document.getElementById('security-overlay');
        overlay.style.transition = "opacity 0.4s ease";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 400);
    }
</script>

</body>
</html>
            
