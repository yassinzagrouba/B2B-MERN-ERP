// routes/company.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats
} = require('../controllers/companyController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Routes publiques (nécessitent une authentification mais pas de rôle spécifique)
router.get('/', verifyToken, getAllCompanies);
router.get('/stats', verifyToken, getCompanyStats);
router.get('/:id', verifyToken, getCompanyById);

// Routes pour les utilisateurs avec permissions (admin ou user autorisé)
router.post('/', verifyToken, createCompany);
router.put('/:id', verifyToken, updateCompany);

// Routes réservées aux administrateurs
router.delete('/:id', verifyToken, isAdmin, deleteCompany);

module.exports = router;
