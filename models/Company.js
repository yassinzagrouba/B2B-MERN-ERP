// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'entreprise est requis'],
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
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour récupérer les clients de cette entreprise
companySchema.virtual('clients', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'company'
});

// Index pour optimiser les recherches
companySchema.index({ name: 1 });
companySchema.index({ email: 1 });
companySchema.index({ status: 1 });

module.exports = mongoose.model('Company', companySchema);
