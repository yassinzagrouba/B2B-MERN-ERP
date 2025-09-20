// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },

  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },

  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: {
      values: ['Electronics', 'Clothing', 'Home & Garden', 'Sports'],
      message: 'La catégorie doit être Electronics, Clothing, Home & Garden, ou Sports'
    }
  },

  image: {
    type: String,
    default: '/images/default-product.jpg'
  },

  clientid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Le client est requis']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour récupérer les commandes de ce produit
productSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'productid'
});

// Index pour optimiser les recherches
productSchema.index({ name: 1 });
productSchema.index({ clientid: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
