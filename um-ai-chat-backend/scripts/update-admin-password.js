const bcrypt = require('bcrypt');
const prisma = require('../config/prismaClient');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
const NEW_PASSWORD = 'faculty';
const ADMIN_USERNAME = 'admin'; // Change this if your admin username is different

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin password...');
    
    // Find admin by username
    const admin = await prisma.admins.findUnique({
      where: { username: ADMIN_USERNAME },
    });

    if (!admin) {
      console.error(`❌ Admin with username "${ADMIN_USERNAME}" not found`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, BCRYPT_ROUNDS);

    // Update password
    await prisma.admins.update({
      where: { id: admin.id },
      data: { password_hashed: hashedPassword },
    });

    console.log(`✅ Successfully updated password for admin "${ADMIN_USERNAME}"`);
    console.log(`   New password: ${NEW_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();

