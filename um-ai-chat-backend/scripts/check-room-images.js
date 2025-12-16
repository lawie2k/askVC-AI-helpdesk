const prisma = require("../config/prismaClient");

console.log("🔍 Checking room images in database...\n");

async function checkRoomImages() {
  try {
    const rooms = await prisma.rooms.findMany({
      select: {
        id: true,
        name: true,
        image_url: true,
        type: true,
        floor: true,
      },
      orderBy: { name: "asc" },
    });

    console.log(`Found ${rooms.length} rooms:\n`);

    const withImages = [];
    const withoutImages = [];

    rooms.forEach((room) => {
      const hasImage = room.image_url && room.image_url.trim() !== '' && room.image_url !== 'null';

      if (hasImage) {
        withImages.push(room);
        console.log(`✅ "${room.name}" (ID: ${room.id}) - HAS IMAGE: ${room.image_url}`);
      } else {
        withoutImages.push(room);
        console.log(`❌ "${room.name}" (ID: ${room.id}) - NO IMAGE`);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Rooms with images: ${withImages.length}`);
    console.log(`   Rooms without images: ${withoutImages.length}`);

    if (withoutImages.length > 0) {
      console.log(`\n🚫 Rooms that won't show images when asked:`);
      withoutImages.forEach(room => {
        console.log(`   - "${room.name}" (${room.type})`);
      });
    }

    if (withImages.length > 0) {
      console.log(`\n✅ Rooms that should show images when asked:`);
      withImages.forEach(room => {
        console.log(`   - "${room.name}" (${room.type})`);
      });
    }

  } catch (error) {
    console.error("❌ Error checking rooms:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoomImages();