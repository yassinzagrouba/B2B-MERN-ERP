// test_login.js - Test login functionality
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test credentials
    const testEmail = 'admin@test.com';
    const testPassword = 'password123';

    console.log(`\n🔐 Testing login for: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);

    // Find user
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n👤 User found:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);

    // Test password comparison
    console.log('\n🔍 Testing password...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);

    if (!isMatch) {
      // Let's also test some other common passwords
      const commonPasswords = ['admin', '123456', 'password', 'admin123'];
      console.log('\n🔧 Testing other common passwords...');
      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`   ✅ Password "${pwd}" matches!`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testLogin();
