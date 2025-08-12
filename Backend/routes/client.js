// routes/client.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientsByCompany,
  getClientStats
} = require('../controllers/clientController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Routes publiques (nécessitent une authentification mais pas de rôle spécifique)
router.get('/', verifyToken, getAllClients);
router.get('/stats', verifyToken, getClientStats);
router.get('/:id', verifyToken, getClientById);

// Route pour récupérer les clients d'une entreprise spécifique
router.get('/company/:companyId', verifyToken, getClientsByCompany);

// Routes pour les utilisateurs avec permissions (admin ou user autorisé)
router.post('/', verifyToken, createClient);
router.put('/:id', verifyToken, updateClient);

// Routes réservées aux administrateurs
router.delete('/:id', verifyToken, isAdmin, deleteClient);

module.exports = router;
