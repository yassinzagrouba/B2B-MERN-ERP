// check_companies.js - Check available companies
require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');

const checkCompanies = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all companies
    const companies = await Company.find({});
    console.log(`\n📊 Found ${companies.length} companies in database:`);
    
    if (companies.length === 0) {
      console.log('❌ No companies found in database');
    } else {
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. Company Details:`);
        console.log(`   ID: ${company._id}`);
        console.log(`   Name: ${company.name}`);
        console.log(`   Email: ${company.email}`);
        console.log(`   Phone: ${company.phone}`);
        console.log(`   Address: ${company.adresse}`);
        console.log(`   Created: ${company.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkCompanies();
