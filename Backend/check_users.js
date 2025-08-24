// check_users.js - Script to check users in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password Hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }

    // Check total count
    const count = await User.countDocuments({});
    console.log(`\n📈 Total user count: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkUsers();
