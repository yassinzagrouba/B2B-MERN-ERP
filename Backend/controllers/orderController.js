// controllers/orderController.js
const Order = require('../models/Order');
const Client = require('../models/Client');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Récupérer toutes les commandes avec pagination, recherche et filtrage
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, clientid, productid } = req.query;
    const query = {};

    // Filtrage par statut
    if (status) {
      query.status = status;
    }

    // Filtrage par client
    if (clientid) {
      query.clientid = clientid;
    }

    // Filtrage par produit
    if (productid) {
      query.productid = productid;
    }

    // Recherche dans les commentaires
    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('clientid', 'name email')
      .populate('productid', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

// Récupérer une commande par ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientid', 'name email phone')
      .populate('productid', 'name description price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message
    });
  }
};

// Créer une nouvelle commande
const createOrder = async (req, res) => {
  try {
    const { clientid, productid, comment, status } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérifier si le produit existe
    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const newOrder = new Order({
      clientid,
      productid,
      comment,
      status: status || 'en_attente'
    });

    const savedOrder = await newOrder.save();

    // Populate les données pour la réponse
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('clientid', 'name email')
      .populate('productid', 'name price');
      
    // Create notification for admin users
    try {
      // Find all admin users
      const admins = await User.find({ role: 'admin' });
      
      // Create notifications for each admin
      for (const admin of admins) {
        await createNotification(
          admin._id,
          `New order created for ${client.name}`,
          'order',
          savedOrder._id,
          'Order'
        );
      }
      
      // Also notify the user who created the order if they're not an admin
      if (req.user && !admins.some(admin => admin._id.toString() === req.user.id)) {
        await createNotification(
          req.user.id,
          `You created a new order for ${client.name}`,
          'order',
          savedOrder._id,
          'Order'
        );
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue with the response even if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: populatedOrder
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

// Mettre à jour une commande
const updateOrder = async (req, res) => {
  try {
    const { clientid, productid, comment, status } = req.body;

    // Vérifier si la commande existe
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier si le nouveau client existe (si fourni)
    if (clientid && clientid !== existingOrder.clientid.toString()) {
      const client = await Client.findById(clientid);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }
    }

    // Vérifier si le nouveau produit existe (si fourni)
    if (productid && productid !== existingOrder.productid.toString()) {
      const product = await Product.findById(productid);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { clientid, productid, comment, status },
      { new: true, runValidators: true }
    ).populate('clientid', 'name email')
     .populate('productid', 'name price');
     
    // Create notification if status has changed
    if (status && existingOrder.status !== status) {
      try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        const statusChange = `Order #${updatedOrder._id.toString().slice(-6)} status updated to ${status}`;
        
        // Create notifications for each admin
        for (const admin of admins) {
          await createNotification(
            admin._id,
            statusChange,
            'order',
            updatedOrder._id,
            'Order'
          );
        }
        
        // Also notify the user who updated the order if they're not an admin
        if (req.user && !admins.some(admin => admin._id.toString() === req.user.id)) {
          await createNotification(
            req.user.id,
            `You updated ${updatedOrder.clientid.name}'s order status to ${status}`,
            'order',
            updatedOrder._id,
            'Order'
          );
        }
      } catch (notifError) {
        console.error('Error creating status change notification:', notifError);
        // Continue with the response even if notification creation fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Commande mise à jour avec succès',
      data: updatedOrder
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la commande',
      error: error.message
    });
  }
};

// Supprimer une commande
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la commande',
      error: error.message
    });
  }
};

// Récupérer les commandes d'un client spécifique (historique)
const getOrdersByClient = async (req, res) => {
  try {
    const { clientid } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const query = { clientid };

    // Filtrage par statut si fourni
    if (status) {
      query.status = status;
    }

    // Vérifier si le client existe
    const client = await Client.findById(clientid);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    const orders = await Order.find(query)
      .populate('productid', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      client: {
        id: client._id,
        name: client.name,
        email: client.email
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes du client',
      error: error.message
    });
  }
};

// Récupérer les commandes d'un produit spécifique
const getOrdersByProduct = async (req, res) => {
  try {
    const { productid } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const query = { productid };

    // Filtrage par statut si fourni
    if (status) {
      query.status = status;
    }

    // Vérifier si le produit existe
    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const orders = await Order.find(query)
      .populate('clientid', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      product: {
        id: product._id,
        name: product.name,
        price: product.price
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes du produit',
      error: error.message
    });
  }
};

// Obtenir les statistiques des commandes
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    
    // Statistiques par mois (derniers 6 mois)
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalOrders,
        byStatus: stats,
        monthlyStats: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByClient,
  getOrdersByProduct,
  getOrderStats
};
