// controllers/companyController.js
const Company = require('../models/Company');
const Client = require('../models/Client');

// Récupérer toutes les entreprises
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    // Recherche par nom ou email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('clients')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCompanies: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
};

// Récupérer une entreprise par ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('clients');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
};

// Créer une nouvelle entreprise
const createCompany = async (req, res) => {
  try {
    const { name, adresse, email, phone } = req.body;

    // Vérifier si l'email existe déjà
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Une entreprise avec cet email existe déjà'
      });
    }

    const newCompany = new Company({
      name,
      adresse,
      email,
      phone
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      data: savedCompany
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
      message: 'Erreur lors de la création de l\'entreprise',
      error: error.message
    });
  }
};

// Mettre à jour une entreprise
const updateCompany = async (req, res) => {
  try {
    const { name, adresse, email, phone } = req.body;

    // Vérifier si l'email existe déjà (sauf pour l'entreprise actuelle)
    if (email) {
      const existingCompany = await Company.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Une autre entreprise avec cet email existe déjà'
        });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, adresse, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entreprise mise à jour avec succès',
      data: updatedCompany
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
      message: 'Erreur lors de la mise à jour de l\'entreprise',
      error: error.message
    });
  }
};

// Supprimer une entreprise
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Vérifier s'il y a des clients associés
    const clientCount = await Client.countDocuments({ company: req.params.id });
    if (clientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer l'entreprise. ${clientCount} client(s) y sont associé(s). Veuillez d'abord supprimer ou réassigner les clients.`
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Entreprise supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'entreprise',
      error: error.message
    });
  }
};

// Obtenir les statistiques des entreprises
const getCompanyStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const companiesWithClients = await Company.aggregate([
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: 'company',
          as: 'clients'
        }
      },
      {
        $match: {
          'clients.0': { $exists: true }
        }
      },
      {
        $count: 'count'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCompanies,
        withClients: companiesWithClients[0]?.count || 0,
        withoutClients: totalCompanies - (companiesWithClients[0]?.count || 0)
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
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats
};
