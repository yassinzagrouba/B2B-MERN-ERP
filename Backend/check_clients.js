// check_clients.js - Script to check clients in database
require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');
const Company = require('./models/Company'); // Import Company model

const checkClients = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all clients
    const clients = await Client.find({}).populate('company', 'name email');
    console.log(`\n📊 Found ${clients.length} clients in database:`);
    
    if (clients.length === 0) {
      console.log('❌ No clients found in database');
    } else {
      clients.forEach((client, index) => {
        console.log(`\n${index + 1}. Client Details:`);
        console.log(`   Name: ${client.name}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Phone: ${client.phone}`);
        console.log(`   Address: ${client.adresse}`);
        console.log(`   Company: ${client.company ? client.company.name : 'None'}`);
        console.log(`   Created: ${client.createdAt}`);
      });
    }

    // Check total count
    const count = await Client.countDocuments({});
    console.log(`\n📈 Total client count: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkClients();
