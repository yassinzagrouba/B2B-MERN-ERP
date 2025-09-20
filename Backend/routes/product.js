// routes/product.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByClient,
  getProductStats
} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Routes publiques (nécessitent une authentification mais pas de rôle spécifique)
router.get('/', verifyToken, getAllProducts);
router.get('/stats', verifyToken, getProductStats);
router.get('/:id', verifyToken, getProductById);

// Route pour récupérer les produits d'un client spécifique
router.get('/client/:clientId', verifyToken, getProductsByClient);

// Routes pour les utilisateurs avec permissions (admin ou user autorisé)
router.post('/', verifyToken, upload.single('image'), createProduct);
router.put('/:id', verifyToken, upload.single('image'), updateProduct);

// Routes réservées aux administrateurs
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
