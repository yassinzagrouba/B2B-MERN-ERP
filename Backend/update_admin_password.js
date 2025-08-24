// update_admin_password.js - Update admin password to password123
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const updateAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const email = 'admin@test.com';
    const newPassword = 'password123';

    console.log(`\n🔄 Updating password for: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user
    const result = await User.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found');
    } else if (result.modifiedCount === 0) {
      console.log('⚠️ User found but password not updated');
    } else {
      console.log('✅ Password updated successfully!');
      
      // Test the new password
      console.log('\n🔍 Testing new password...');
      const user = await User.findOne({ email: email });
      const isMatch = await bcrypt.compare(newPassword, user.password);
      console.log(`   Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

updateAdminPassword();
