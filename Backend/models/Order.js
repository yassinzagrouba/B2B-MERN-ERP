// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'L\'ID du client est requis']
  },
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'L\'ID du produit est requis']
  },
  comment: {
    type: String,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  status: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'],
    default: 'en_attente',
    required: [true, 'Le statut de la commande est requis']
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
orderSchema.index({ clientid: 1, status: 1 });
orderSchema.index({ productid: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
