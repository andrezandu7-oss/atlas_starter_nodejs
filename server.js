const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('<h1>Genlove est en ligne !</h1><a href="/signup">Creer un profil</a>');
});

app.get('/signup', (req, res) => {
    res.send('<h2>Inscription</h2><form action="/profile" method="GET"><input name="fn" placeholder="Prenom"><button>Valider</button></form>');
});

app.get('/profile', (req, res) => {
    const name = req.query.fn || "Utilisateur";
    res.send('<h1>Bienvenue ' + name + '</h1><p>Ton profil sante est securise.</p>');
});

app.listen(port, '0.0.0.0', () => {
    console.log('Application lancée sur le port ' + port);
});
