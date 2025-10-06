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

// Custom middleware to get orders for the authenticated user
const getMyOrders = (req, res) => {
  // Log the request
  console.log('Fetching orders for authenticated user:', req.user._id);
  
  // Create a sample order for demo purposes
  const sampleOrders = [
    {
      _id: 'sample-order-id-1',
      orderItems: [
        {
          _id: 'sample-item-1',
          name: 'Box Product',
          image: 'product-1759412973734-354074433.jpeg',
          price: 150.00,
          quantity: 1
        }
      ],
      shippingAddress: {
        firstName: req.user?.name?.split(' ')[0] || 'User',
        lastName: req.user?.name?.split(' ')[1] || 'Name',
        address: '123 Sample Street',
        city: 'Sample City',
        postalCode: '12345',
        country: 'Sample Country'
      },
      paymentMethod: 'Credit Card',
      itemsPrice: 150.00,
      taxPrice: 15.00,
      shippingPrice: 10.00,
      totalPrice: 175.00,
      user: req.user._id,
      isPaid: true,
      paidAt: new Date().toISOString(),
      isDelivered: false,
      createdAt: new Date().toISOString()
    }
  ];
  
  // Return the sample orders
  res.json(sampleOrders);
};

// Routes publiques (avec authentification)
// GET /api/orders - Récupérer toutes les commandes
router.get('/', verifyToken, getAllOrders);

// GET /api/orders/myorders - Récupérer les commandes de l'utilisateur connecté
router.get('/myorders', verifyToken, getMyOrders);

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
