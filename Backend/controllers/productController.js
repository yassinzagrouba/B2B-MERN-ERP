// controllers/productController.js
const Product = require('../models/Product');
const Client = require('../models/Client');

// Récupérer tous les produits
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, clientid, search, minPrice, maxPrice } = req.query;
    const query = {};

    // Filtrer par client si spécifié
    if (clientid) {
      query.clientid = clientid;
    }

    // Recherche par nom ou description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrer par prix
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('clientid', 'name email company')
      .populate({
        path: 'clientid',
        populate: {
          path: 'company',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// Récupérer un produit par ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('clientid', 'name email phone adresse company')
      .populate({
        path: 'clientid',
        populate: {
          path: 'company',
          select: 'name email phone adresse'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// Créer un nouveau produit
const createProduct = async (req, res) => {
  try {
    const { name, description, price, clientid, category } = req.body;

    // Vérifier si les données sont présentes
    if (!name || !description || !price || !clientid || !category) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
        received: { name, description, price, clientid, category }
      });
    }

    // Vérifier si le client existe
    const clientExists = await Client.findById(clientid);
    if (!clientExists) {
      return res.status(400).json({
        success: false,
        message: 'Le client spécifié n\'existe pas'
      });
    }

    // Handle image upload
    let imagePath = '/images/default-product.jpg'; // Default image
    
    if (req.file) {
      // If file is uploaded, use its path
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image: imagePath,
      clientid
    });

    const savedProduct = await newProduct.save();
    await savedProduct.populate('clientid', 'name email company');
    await savedProduct.populate({
      path: 'clientid',
      populate: {
        path: 'company',
        select: 'name email'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: savedProduct
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
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// Mettre à jour un produit
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, clientid, category } = req.body;

    // Si le client change, vérifier qu'il existe
    if (clientid) {
      const clientExists = await Client.findById(clientid);
      if (!clientExists) {
        return res.status(400).json({
          success: false,
          message: 'Le client spécifié n\'existe pas'
        });
      }
    }
    
    // Create update object
    const updateData = { name, description, price, clientid, category };
    
    // Handle image update if a new file is uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      
      // If there's an existing image, we could delete it here (optional)
      // const product = await Product.findById(req.params.id);
      // if (product.image && product.image !== '/images/default-product.jpg') {
      //   const oldImagePath = path.join(__dirname, '..', product.image);
      //   if (fs.existsSync(oldImagePath)) {
      //     fs.unlinkSync(oldImagePath);
      //   }
      // }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('clientid', 'name email company')
    .populate({
      path: 'clientid',
      populate: {
        path: 'company',
        select: 'name email'
      }
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
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
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

// Supprimer un produit
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};

// Récupérer les produits d'un client spécifique
const getProductsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const query = { clientid: clientId };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits du client',
      error: error.message
    });
  }
};

// Obtenir les statistiques des produits
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const topClients = await Product.aggregate([
      {
        $group: {
          _id: '$clientid',
          productCount: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $project: {
          client: { $arrayElemAt: ['$client.name', 0] },
          productCount: 1,
          totalValue: 1
        }
      },
      {
        $sort: { productCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalProducts,
        priceStats: priceStats[0] || {
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalValue: 0
        },
        topClientsByProducts: topClients
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
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByClient,
  getProductStats
};
