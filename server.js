// ============================================
// PAGE D'INSCRIPTION AVEC QR - VERSION CORRIGÉE
// ============================================
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Inscription QR</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Roboto, sans-serif;
            background: #fdf2f2;
            display: flex;
            justify-content: center;
            align-items: flex-start;
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
        .page-white {
            background: white;
            padding: 25px 20px;
            flex: 1;
        }
        h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #1a2a44;
        }
        .subtitle {
            color: #666;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        
        /* Section QR Scan */
        .qr-scan-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 20px;
            border-radius: 20px;
            margin-bottom: 25px;
            text-align: center;
        }
        .qr-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .qr-scan-section h3 {
            font-size: 1.3rem;
            margin-bottom: 8px;
        }
        .qr-scan-section p {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 15px;
        }
        .btn-scan {
            background: white;
            color: #764ba2;
            border: none;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: bold;
            width: 100%;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        .btn-scan:hover {
            transform: translateY(-2px);
        }
        #qr-reader {
            width: 100%;
            max-width: 300px;
            margin: 15px auto;
            border-radius: 15px;
            overflow: hidden;
            display: none;
            background: white;
            padding: 10px;
        }
        #qr-reader video {
            width: 100%;
            border-radius: 10px;
        }
        .scan-status {
            margin-top: 10px;
            font-size: 0.9rem;
            min-height: 20px;
        }
        
        /* Séparateur */
        .separator {
            display: flex;
            align-items: center;
            text-align: center;
            color: #999;
            margin: 20px 0;
        }
        .separator::before,
        .separator::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #ddd;
        }
        .separator span {
            padding: 0 10px;
        }
        
        /* Formulaire */
        .manual-section h3 {
            color: #1a2a44;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
            font-size: 0.9rem;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            font-size: 1rem;
            background: #f8f9fa;
            transition: border 0.3s;
        }
        input:focus {
            border-color: #ff416c;
            outline: none;
        }
        input[readonly] {
            background: #f0f0f0;
            border-color: #4caf50;
            color: #333;
        }
        .input-hint {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        }
        .input-hint i {
            color: #4caf50;
        }
        
        /* Bouton */
        .btn-pink {
            background: #ff416c;
            color: white;
            padding: 18px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            width: 100%;
            border: none;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            margin-top: 15px;
        }
        .btn-pink:hover:not(:disabled) {
            background: #ff1a4f;
            transform: translateY(-2px);
        }
        .btn-pink:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .manual-link {
            text-align: center;
            margin-top: 20px;
        }
        .manual-link a {
            color: #666;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .manual-link a:hover {
            color: #ff416c;
        }
        
        .verified-badge {
            background: #4caf50;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.7rem;
            display: inline-block;
            margin-left: 5px;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #666;
            text-decoration: none;
        }
        
        /* Zone de test */
        .test-qr-section {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 15px;
            margin-top: 30px;
            border: 2px dashed #999;
        }
        .test-qr-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .test-qr-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .test-qr-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 10px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            flex: 1;
        }
        .test-qr-btn:hover {
            background: #667eea;
            color: white;
        }
        #stop-scan {
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            margin-top: 10px;
            cursor: pointer;
            display: none;
        }
    </style>
    
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Créer mon compte</h2>
            <p class="subtitle">Scannez votre QR code ou saisissez vos informations</p>
            
            <!-- SECTION SCAN QR -->
            <div class="qr-scan-section">
                <div class="qr-icon">📸</div>
                <h3>Vous avez un certificat médical ?</h3>
                <p>Scannez le QR code pour remplir automatiquement vos informations</p>
                
                <div id="qr-reader"></div>
                <button id="stop-scan" onclick="stopScanner()">⏹️ Arrêter le scan</button>
                
                <button class="btn-scan" onclick="startQRScanner()">
                    📱 Scanner mon QR code
                </button>
                
                <div id="scan-status" class="scan-status"></div>
            </div>
            
            <!-- SÉPARATEUR -->
            <div class="separator">
                <span>ou</span>
            </div>
            
            <!-- FORMULAIRE -->
            <div class="manual-section">
                <h3>Remplir manuellement</h3>
                
                <div class="form-group">
                    <label>Nom complet <span class="verified-badge" id="qr-badge" style="display: none;">✅ QR scanné</span></label>
                    <input type="text" id="fullName" placeholder="Votre nom" readonly>
                    <div class="input-hint" id="fullNameHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Génotype</label>
                    <input type="text" id="genotype" placeholder="AA / AS / SS" readonly>
                    <div class="input-hint" id="genotypeHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Groupe sanguin</label>
                    <input type="text" id="bloodGroup" placeholder="Ex: A+, O-..." readonly>
                    <div class="input-hint" id="bloodGroupHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Date de naissance</label>
                    <input type="text" id="dob" placeholder="JJ/MM/AAAA" readonly>
                    <div class="input-hint" id="dobHint">🔒 En attente de scan...</div>
                </div>
                
                <button id="submitBtn" class="btn-pink" disabled onclick="submitForm()">
                    ✅ Créer mon compte certifié
                </button>
                
                <p class="manual-link">
                    <a href="#" onclick="enableManualEntry()">
                        Je n'ai pas de QR code, saisie manuelle
                    </a>
                </p>
            </div>
            
            <!-- ZONE DE TEST -->
            <div class="test-qr-section">
                <div class="test-qr-title">🧪 QR codes de test</div>
                <div class="test-qr-buttons">
                    <button class="test-qr-btn" onclick="simulateQR('AA', 'O+', '1990-05-15')">AA / O+</button>
                    <button class="test-qr-btn" onclick="simulateQR('AS', 'A+', '1992-08-20')">AS / A+</button>
                    <button class="test-qr-btn" onclick="simulateQR('SS', 'B-', '1988-12-10')">SS / B-</button>
                </div>
            </div>
            
            <a href="/" class="back-link">← Retour à l'accueil</a>
        </div>
    </div>

    <script>
        let html5QrCode = null;
        let scannerActive = false;
        
        function startQRScanner() {
            const readerDiv = document.getElementById('qr-reader');
            const stopBtn = document.getElementById('stop-scan');
            const scanBtn = document.querySelector('.btn-scan');
            
            readerDiv.style.display = 'block';
            stopBtn.style.display = 'block';
            scanBtn.style.display = 'none';
            
            html5QrCode = new Html5Qrcode("qr-reader");
            
            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                try {
                    const qrData = JSON.parse(decodedText);
                    
                    // Vérifier que c'est un QR code valide
                    if (qrData.patientName && qrData.genotype && qrData.bloodGroup) {
                        fillForm(qrData);
                        stopScanner();
                    } else {
                        showStatus('❌ Format de QR code invalide', 'error');
                    }
                } catch(e) {
                    showStatus('❌ QR code invalide', 'error');
                }
            };
            
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback,
                (errorMessage) => {
                    // Ignorer les erreurs de scan (c'est normal)
                }
            ).then(() => {
                scannerActive = true;
                showStatus('📸 Scanner actif - pointez vers un QR code', 'info');
            }).catch((err) => {
                showStatus('❌ Erreur caméra: ' + err, 'error');
                stopScanner();
            });
        }
        
        function stopScanner() {
            if (html5QrCode && scannerActive) {
                html5QrCode.stop().then(() => {
                    scannerActive = false;
                    document.getElementById('qr-reader').style.display = 'none';
                    document.getElementById('stop-scan').style.display = 'none';
                    document.querySelector('.btn-scan').style.display = 'block';
                    showStatus('', 'info');
                }).catch((err) => {
                    console.warn(err);
                });
            }
        }
        
        function simulateQR(genotype, bloodGroup, dob) {
            const mockQR = {
                patientName: 'João Manuel Silva',
                genotype: genotype,
                bloodGroup: bloodGroup,
                dateOfBirth: dob,
                issuedBy: 'Laboratorio Central',
                patientId: 'ANG-1990-123456'
            };
            fillForm(mockQR);
        }
        
        function fillForm(qrData) {
            document.getElementById('fullName').value = qrData.patientName;
            document.getElementById('genotype').value = qrData.genotype;
            document.getElementById('bloodGroup').value = qrData.bloodGroup;
            document.getElementById('dob').value = formatDate(qrData.dateOfBirth);
            
            document.getElementById('qr-badge').style.display = 'inline-block';
            
            document.getElementById('fullNameHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('genotypeHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('bloodGroupHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('dobHint').innerHTML = '✅ Données vérifiées par QR code';
            
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = '✅ Créer mon compte certifié';
            
            showStatus('✅ Scan réussi ! Données chargées', 'success');
        }
        
        function enableManualEntry() {
            document.getElementById('fullName').readOnly = false;
            document.getElementById('genotype').readOnly = false;
            document.getElementById('bloodGroup').readOnly = false;
            document.getElementById('dob').readOnly = false;
            
            document.getElementById('fullName').value = '';
            document.getElementById('genotype').value = '';
            document.getElementById('bloodGroup').value = '';
            document.getElementById('dob').value = '';
            
            document.getElementById('fullNameHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('genotypeHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('bloodGroupHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('dobHint').innerHTML = '📝 Saisie manuelle';
            
            document.getElementById('qr-badge').style.display = 'none';
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = 'Créer mon compte (non certifié)';
        }
        
        function submitForm() {
            const userData = {
                fullName: document.getElementById('fullName').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                dob: document.getElementById('dob').value,
                verified: document.getElementById('qr-badge').style.display === 'inline-block'
            };
            
            if (!userData.fullName || !userData.genotype || !userData.bloodGroup || !userData.dob) {
                alert('❌ Veuillez remplir tous les champs');
                return;
            }
            
            console.log('Données envoyées:', userData);
            localStorage.setItem('genlove_user', JSON.stringify(userData));
            
            alert('✅ Compte créé avec succès !');
            window.location.href = '/profile-qr';
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('scan-status');
            statusDiv.innerHTML = message;
            if (type === 'success') statusDiv.style.color = '#4caf50';
            else if (type === 'error') statusDiv.style.color = '#ff4444';
            else statusDiv.style.color = '#666';
        }
        
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR');
        }
        
        // Nettoyer le scanner si on quitte la page
        window.addEventListener('beforeunload', function() {
            if (html5QrCode && scannerActive) {
                html5QrCode.stop();
            }
        });
    </script>
</body>
</html>`);
});