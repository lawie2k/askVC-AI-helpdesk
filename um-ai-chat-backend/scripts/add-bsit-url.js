const prisma = require('../config/prismaClient');

async function addBSITUrl() {
  try {
    const url = 'https://umindanao.edu.ph/files/eriao/bsit.pdf';
    
    // Check if URL already exists
    const existing = await prisma.scanned_urls.findFirst({
      where: { url: url }
    });

    if (existing) {
      console.log('✅ URL already exists in database');
      console.log('ID:', existing.id);
      console.log('Title:', existing.title);
      console.log('Active:', existing.is_active);
      process.exit(0);
    }

    // Add the URL
    const result = await prisma.scanned_urls.create({
      data: {
        url: url,
        title: 'BSIT Course Offerings',
        description: 'Bachelor of Science in Information Technology course offerings for SY 2022-2023',
        is_active: true,
        admin_id: null
      }
    });

    console.log('✅ Successfully added BSIT URL to scanned URLs!');
    console.log('ID:', result.id);
    console.log('URL:', result.url);
    console.log('Title:', result.title);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding URL:', error.message);
    process.exit(1);
  }
}

addBSITUrl();

