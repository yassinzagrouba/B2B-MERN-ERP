// routes/order.js
const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByClient,
  getOrdersByProduct,
  getOrderStats
} = require('../controllers/orderController');

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Routes publiques (avec authentification)
// GET /api/orders - Récupérer toutes les commandes
router.get('/', verifyToken, getAllOrders);

// GET /api/orders/stats - Obtenir les statistiques (admin seulement)
router.get('/stats', verifyToken, isAdmin, getOrderStats);

// GET /api/orders/client/:clientid - Récupérer les commandes d'un client
router.get('/client/:clientid', verifyToken, getOrdersByClient);

// GET /api/orders/product/:productid - Récupérer les commandes d'un produit
router.get('/product/:productid', verifyToken, getOrdersByProduct);

// GET /api/orders/:id - Récupérer une commande par ID
router.get('/:id', verifyToken, getOrderById);

// POST /api/orders - Créer une nouvelle commande
router.post('/', verifyToken, createOrder);

// PUT /api/orders/:id - Mettre à jour une commande
router.put('/:id', verifyToken, updateOrder);

// DELETE /api/orders/:id - Supprimer une commande (admin seulement)
router.delete('/:id', verifyToken, isAdmin, deleteOrder);

module.exports = router;
