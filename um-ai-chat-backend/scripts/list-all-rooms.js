const db = require("../config/database");

console.log("🔍 Listing all rooms in database...\n");

db.query("SELECT * FROM rooms ORDER BY name", [], (err, results) => {
  if (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
  
  console.log(`📋 Found ${results.length} rooms:\n`);
  
  if (results.length === 0) {
    console.log("   No rooms found in database");
  } else {
    results.forEach((room, index) => {
      console.log(`${index + 1}. "${room.name}"`);
      console.log(`   - ID: ${room.id}`);
      console.log(`   - Type: ${room.type}`);
      console.log(`   - Floor: ${room.floor}`);
      console.log(`   - Image URL: ${room.image_url ? `✅ ${room.image_url.substring(0, 60)}...` : "❌ NULL/EMPTY"}`);
      console.log(`   - Building ID: ${room.building_id || "NULL"}`);
      console.log("");
    });
  }
  
  process.exit(0);
});

