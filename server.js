const express = require('express');
const app = express();
const port = 3000;

// ============================================
// PAGE D'ACCUEIL
// ============================================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Accueil</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4e9da;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 400px;
            background: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h1 { color: #1a2a44; font-size: 3rem; margin: 0; }
        .pink { color: #ff416c; }
        .slogan { color: #666; margin: 20px 0; }
        .btn {
            display: block;
            padding: 15px;
            margin: 10px 0;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            background: #ff416c;
            color: white;
        }
        .btn.dark { background: #1a2a44; }
    </style>
</head>
<body>
    <div class="container">
        <h1><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1>
        <div class="slogan">Unissez cœur et santé 💑</div>
        <a href="/signup" class="btn dark">Créer un compte</a>
        <a href="/login" class="btn">Se connecter</a>
    </div>
</body>
</html>`);
});

// ============================================
// PAGE D'INSCRIPTION AVEC SCAN QR
// ============================================
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription - Genlove</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4e9da;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 400px;
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h2 { color: #1a2a44; margin-bottom: 20px; }
        
        /* Scanner */
        .scanner-section {
            background: #1a2a44;
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 20px;
        }
        #camera-container {
            width: 100%;
            height: 250px;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
            display: none;
        }
        #qr-reader {
            width: 100%;
            height: 100%;
        }
        .scan-btn {
            background: #ff416c;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 30px;
            width: 100%;
            font-size: 1.1rem;
            cursor: pointer;
            margin: 10px 0;
        }
        .stop-btn {
            background: #666;
            display: none;
        }
        
        /* Formulaire */
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        input[readonly] {
            background: #f0f0f0;
            border-color: #4caf50;
        }
        .badge {
            background: #4caf50;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            display: inline-block;
            margin-left: 10px;
        }
        .submit-btn {
            background: #ff416c;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 30px;
            width: 100%;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
        }
        .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #666;
            text-decoration: none;
        }
        
        /* Test */
        .test-section {
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            border: 2px dashed #999;
        }
        .test-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 5px;
            border-radius: 8px;
            cursor: pointer;
        }
    </style>
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="container">
        <h2>Créer mon compte</h2>
        
        <!-- SCANNER -->
        <div class="scanner-section">
            <div>📸 Scannez votre QR code</div>
            <div id="camera-container">
                <div id="qr-reader"></div>
            </div>
            <button class="scan-btn" id="startBtn" onclick="startScanner()">Activer la caméra</button>
            <button class="scan-btn stop-btn" id="stopBtn" onclick="stopScanner()">Arrêter</button>
            <div id="status" style="margin-top:10px;"></div>
        </div>
        
        <!-- FORMULAIRE -->
        <div class="form-group">
            <label>Nom complet <span class="badge" id="qrBadge" style="display:none;">QR scanné</span></label>
            <input type="text" id="fullName" readonly>
        </div>
        <div class="form-group">
            <label>Génotype</label>
            <input type="text" id="genotype" readonly>
        </div>
        <div class="form-group">
            <label>Groupe sanguin</label>
            <input type="text" id="bloodGroup" readonly>
        </div>
        
        <button class="submit-btn" id="submitBtn" disabled onclick="submitForm()">Créer mon compte</button>
        
        <!-- ZONE DE TEST -->
        <div class="test-section">
            <div style="font-weight:bold; margin-bottom:10px;">🧪 QR codes de test</div>
            <button class="test-btn" onclick="fillTestData('AA', 'O+')">AA / O+</button>
            <button class="test-btn" onclick="fillTestData('AS', 'A+')">AS / A+</button>
            <button class="test-btn" onclick="fillTestData('SS', 'B-')">SS / B-</button>
        </div>
        
        <a href="/" class="back-link">← Retour</a>
    </div>

    <script>
        let scanner = null;
        
        function startScanner() {
            document.getElementById('camera-container').style.display = 'block';
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'block';
            
            scanner = new Html5Qrcode("qr-reader");
            
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.patientName && data.genotype && data.bloodGroup) {
                            document.getElementById('fullName').value = data.patientName;
                            document.getElementById('genotype').value = data.genotype;
                            document.getElementById('bloodGroup').value = data.bloodGroup;
                            document.getElementById('qrBadge').style.display = 'inline-block';
                            document.getElementById('submitBtn').disabled = false;
                            document.getElementById('status').innerHTML = '✅ Scan réussi !';
                            stopScanner();
                        }
                    } catch(e) {
                        document.getElementById('status').innerHTML = '❌ QR code invalide';
                    }
                },
                (error) => {}
            ).catch((err) => {
                document.getElementById('status').innerHTML = '❌ Erreur caméra';
            });
        }
        
        function stopScanner() {
            if (scanner) {
                scanner.stop().then(() => {
                    document.getElementById('camera-container').style.display = 'none';
                    document.getElementById('startBtn').style.display = 'block';
                    document.getElementById('stopBtn').style.display = 'none';
                });
            }
        }
        
        function fillTestData(genotype, bloodGroup) {
            document.getElementById('fullName').value = 'João Manuel Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('bloodGroup').value = bloodGroup;
            document.getElementById('qrBadge').style.display = 'inline-block';
            document.getElementById('submitBtn').disabled = false;
        }
        
        function submitForm() {
            alert('✅ Compte créé avec succès !');
            window.location.href = '/';
        }
    </script>
</body>
</html>`);
});

// ============================================
// PAGE LOGIN (simplifiée)
// ============================================
app.get('/login', (req, res) => {
    res.send('<h2 style="text-align:center;margin-top:50px;">Page de connexion</h2><p style="text-align:center;"><a href="/">Retour</a></p>');
});

app.listen(port, () => {
    console.log(`🚀 Serveur sur http://localhost:${port}`);
});