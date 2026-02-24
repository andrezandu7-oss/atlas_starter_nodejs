const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Ajouter pour les appels fetch
const app = express();

// --- CONFIGURATION AVANCÉE ---
app.use(cors()); // Sécurité pour fetch frontend
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public')); // Pour futurs assets

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/genlove";

// Connexion MongoDB avec retry
mongoose.connect(MONGO_URI, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000 
})
.then(() => console.log("✅ MongoDB Connecté"))
.catch(err => console.error("❌ MongoDB:", err));

// Schéma User amélioré avec validation
const UserSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    genotype: { 
        type: String, 
        uppercase: true, 
        enum: ['AA', 'AS', 'SS'],
        required: true 
    },
    groupeSanguin: { 
        type: String, 
        required: true,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    },
    email: { 
        type: String, 
        unique: true, 
        required: true,
        lowercase: true,
        match: [/^S+@S+.S+$/, 'Email invalide']
    },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ email: 1 });
const User = mongoose.model('User', UserSchema);

// --- ROUTES API AMÉLIORÉES ---
app.post('/api/register', async (req, res) => {
    try {
        // Validation côté serveur
        const { nom, genotype, groupeSanguin, email } = req.body;
        
        if (!nom || !genotype || !groupeSanguin || !email) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        const newUser = new User({
            nom: nom.trim(),
            genotype: genotype.toUpperCase(),
            groupeSanguin,
            email: email.toLowerCase()
        });

        await newUser.save();
        res.status(201).json({ 
            success: true, 
            message: "Compte créé avec succès !",
            userId: newUser._id 
        });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ error: "Cet email est déjà utilisé" });
        }
        console.error("Erreur register:", e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour vérifier si email existe (login futur)
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        res.json({ exists: !!user });
    } catch (e) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Garder toutes vos pages existantes (/, /generator, /signup, /login)...
// [Le reste du code des pages reste identique]

// Health check pour monitoring
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Genlove v2 démarré sur http://localhost:" + PORT);
    console.log("📱 Testez: /signup | /generator | /health");
});