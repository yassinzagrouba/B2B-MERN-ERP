// seed.js - Script to create test data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Create test user if it doesn't exist
    const existingUser = await User.findOne({ email: 'admin@test.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const testUser = new User({
        username: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      await testUser.save();
      console.log('👤 Created test user: admin@test.com / password123');
    } else {
      console.log('👤 Test user already exists');
    }

    // Check if we have data already
    const companyCount = await Company.countDocuments();
    const clientCount = await Client.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    if (companyCount === 0) {
      // Create test companies
      const companies = await Company.insertMany([
        {
          name: 'Tech Solutions Inc',
          address: '123 Innovation St, Tech City, TC 12345',
          industry: 'technology',
          email: 'contact@techsolutions.com',
          phone: '+1-555-0101',
          website: 'https://techsolutions.com',
          description: 'Leading provider of innovative technology solutions'
        },
        {
          name: 'Green Energy Corp',
          address: '456 Renewable Ave, Eco City, EC 67890',
          industry: 'energy',
          email: 'info@greenenergy.com',
          phone: '+1-555-0202',
          website: 'https://greenenergy.com',
          description: 'Sustainable energy solutions for a better future'
        },
        {
          name: 'Healthcare Partners',
          address: '789 Medical Blvd, Health City, HC 13579',
          industry: 'healthcare',
          email: 'contact@healthpartners.com',
          phone: '+1-555-0303',
          description: 'Comprehensive healthcare services'
        }
      ]);
      console.log(`🏢 Created ${companies.length} companies`);

      // Create test clients
      const clients = await Client.insertMany([
        {
          name: 'John Smith',
          email: 'john.smith@techsolutions.com',
          phone: '+1-555-1001',
          companyid: companies[0]._id
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@greenenergy.com',
          phone: '+1-555-1002',
          companyid: companies[1]._id
        },
        {
          name: 'Michael Brown',
          email: 'michael.brown@healthpartners.com',
          phone: '+1-555-1003',
          companyid: companies[2]._id
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '+1-555-1004'
          // No company assigned
        },
        {
          name: 'Robert Wilson',
          email: 'robert.wilson@techsolutions.com',
          phone: '+1-555-1005',
          companyid: companies[0]._id
        }
      ]);
      console.log(`👥 Created ${clients.length} clients`);

      // Create test products
      const products = await Product.insertMany([
        {
          name: 'Cloud Storage Pro',
          price: 99.99,
          description: 'Professional cloud storage solution with 1TB capacity',
          category: 'technology',
          quantity: 50
        },
        {
          name: 'Solar Panel Kit',
          price: 2499.99,
          description: '5kW residential solar panel system with installation',
          category: 'energy',
          quantity: 25
        },
        {
          name: 'Health Monitoring Device',
          price: 199.99,
          description: 'Wearable health monitoring device with heart rate and sleep tracking',
          category: 'healthcare',
          quantity: 100
        },
        {
          name: 'Web Development Package',
          price: 1499.99,
          description: 'Complete web development package for small businesses',
          category: 'technology',
          quantity: 10
        },
        {
          name: 'Energy Audit Service',
          price: 299.99,
          description: 'Comprehensive energy efficiency audit for buildings',
          category: 'energy',
          quantity: 30
        },
        {
          name: 'Telemedicine Platform',
          price: 799.99,
          description: 'Monthly subscription to telemedicine platform',
          category: 'healthcare',
          quantity: 75
        }
      ]);
      console.log(`📦 Created ${products.length} products`);

      // Create test orders
      const orders = await Order.insertMany([
        {
          clientid: clients[0]._id,
          productid: products[0]._id,
          status: 'confirmee',
          comment: 'Urgent delivery requested'
        },
        {
          clientid: clients[1]._id,
          productid: products[1]._id,
          status: 'en_preparation',
          comment: 'Installation scheduled for next week'
        },
        {
          clientid: clients[2]._id,
          productid: products[2]._id,
          status: 'expediee',
          comment: 'Tracking number: TRK123456789'
        },
        {
          clientid: clients[0]._id,
          productid: products[3]._id,
          status: 'livree',
          comment: 'Project completed successfully'
        },
        {
          clientid: clients[3]._id,
          productid: products[4]._id,
          status: 'en_attente',
          comment: 'Waiting for client confirmation'
        },
        {
          clientid: clients[4]._id,
          productid: products[5]._id,
          status: 'confirmee',
          comment: 'Monthly subscription activated'
        },
        {
          clientid: clients[1]._id,
          productid: products[0]._id,
          status: 'annulee',
          comment: 'Client requested cancellation'
        }
      ]);
      console.log(`📋 Created ${orders.length} orders`);
    } else {
      console.log('📊 Test data already exists, skipping creation');
    }

    const finalCounts = {
      companies: await Company.countDocuments(),
      clients: await Client.countDocuments(),
      products: await Product.countDocuments(),
      orders: await Order.countDocuments()
    };

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📊 Current database contents:');
    console.log(`  - Users: 1 (admin@test.com / password123)`);
    console.log(`  - Companies: ${finalCounts.companies}`);
    console.log(`  - Clients: ${finalCounts.clients}`);
    console.log(`  - Products: ${finalCounts.products}`);
    console.log(`  - Orders: ${finalCounts.orders}`);
    console.log('\n🚀 You can now test the CRUD operations!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedData();
