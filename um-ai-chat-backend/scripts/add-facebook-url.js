const prisma = require('../config/prismaClient');

async function addFacebookUrl() {
  try {
    const url = 'https://www.facebook.com/umtc.official';
    
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
        title: 'UMTC Official Facebook Page',
        description: 'University of Mindanao Tagum College official Facebook page for announcements and updates',
        is_active: true,
        admin_id: null
      }
    });

    console.log('✅ Successfully added Facebook URL to scanned URLs!');
    console.log('ID:', result.id);
    console.log('URL:', result.url);
    console.log('Title:', result.title);
    console.log('\n⚠️  Note: Facebook pages require login and use dynamic content.');
    console.log('   The scraper may not be able to fetch content from Facebook.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding URL:', error.message);
    process.exit(1);
  }
}

addFacebookUrl();

