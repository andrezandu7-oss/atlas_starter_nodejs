const { connectToDatabase } = require('./db/connect');

connectToDatabase();// --- À COLLER DANS app/services.js ---

// ... code existant pour createUser ...

async function getAllUsers() {
    try {
        const db = require('../db/connect').getDb(); 
        const collection = db.collection('users');

        const users = await collection.find({}).toArray(); 

        return users;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error; 
    }
}

module.exports = {
    createUser,
    getAllUsers, // <--- C'est l'ajout important
};