// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialiser l'app Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // For reading cookies
app.use(cors({
  credentials: true, // Allow cookies in CORS
  origin: true
}));

// Connexion MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => console.error('❌ Erreur MongoDB :', err));

// Importer les routes d'authentification
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Importer les routes utilisateur
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// Importer les routes entreprises
const companyRoutes = require('./routes/company');
app.use('/api/companies', companyRoutes);

// Importer les routes clients
const clientRoutes = require('./routes/client');
app.use('/api/clients', clientRoutes);

// Importer les routes produits
const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

// Importer les routes commandes
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

/*// Importer les routes de test
const testRoutes = require('./routes/test');
app.use('/api/test', testRoutes);*/

// Route de test
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API B2B App');
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
