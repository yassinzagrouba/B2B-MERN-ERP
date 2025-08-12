// controllers/clientController.js
const Client = require('../models/Client');
const Company = require('../models/Company');

// Récupérer tous les clients
const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, company, search } = req.query;
    const query = {};

    // Filtrer par entreprise si spécifié
    if (company) {
      query.company = company;
    }

    // Recherche par nom ou email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .populate('company', 'name email phone adresse')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalClients: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error.message
    });
  }
};

// Récupérer un client par ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('company', 'name email phone adresse');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client',
      error: error.message
    });
  }
};

// Créer un nouveau client
const createClient = async (req, res) => {
  try {
    const { 
      name, 
      adresse, 
      email, 
      phone, 
      company
    } = req.body;

    // Vérifier si l'entreprise existe
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({
        success: false,
        message: 'L\'entreprise spécifiée n\'existe pas'
      });
    }

    // Vérifier si l'email existe déjà
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec cet email existe déjà'
      });
    }

    const newClient = new Client({
      name,
      adresse,
      email,
      phone,
      company
    });

    const savedClient = await newClient.save();
    await savedClient.populate('company', 'name email phone adresse');

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: savedClient
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
      message: 'Erreur lors de la création du client',
      error: error.message
    });
  }
};

// Mettre à jour un client
const updateClient = async (req, res) => {
  try {
    const { 
      name, 
      adresse, 
      email, 
      phone, 
      company
    } = req.body;

    // Si l'entreprise change, vérifier qu'elle existe
    if (company) {
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'entreprise spécifiée n\'existe pas'
        });
      }
    }

    // Vérifier si l'email existe déjà (sauf pour le client actuel)
    if (email) {
      const existingClient = await Client.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Un autre client avec cet email existe déjà'
        });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        adresse, 
        email, 
        phone, 
        company
      },
      { new: true, runValidators: true }
    ).populate('company', 'name email phone adresse');

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: updatedClient
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
      message: 'Erreur lors de la mise à jour du client',
      error: error.message
    });
  }
};

// Supprimer un client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error.message
    });
  }
};

// Récupérer les clients d'une entreprise spécifique
const getClientsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const query = { company: companyId };

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalClients: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients de l\'entreprise',
      error: error.message
    });
  }
};

// Obtenir les statistiques des clients
const getClientStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const clientsByCompany = await Client.aggregate([
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $project: {
          company: { $arrayElemAt: ['$company.name', 0] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalClients,
        topCompaniesByClients: clientsByCompany
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
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientsByCompany,
  getClientStats
};
