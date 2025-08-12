// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true,
    maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
  },

  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },

  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Veuillez entrer un numéro de téléphone valide']
  },

  // Relation avec l'entreprise (un client appartient à une entreprise)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'L\'entreprise est requise']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour récupérer les produits de ce client
clientSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'clientid'
});

// Index pour optimiser les recherches
clientSchema.index({ name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ company: 1 });

module.exports = mongoose.model('Client', clientSchema);
