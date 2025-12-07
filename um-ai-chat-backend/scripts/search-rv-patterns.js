const db = require("../config/database");

console.log("🔍 Searching for rooms that might be RV2...\n");

// Search for various patterns
const patterns = [
  "SELECT * FROM rooms WHERE LOWER(name) LIKE '%v2%'",
  "SELECT * FROM rooms WHERE LOWER(name) LIKE '%v 2%'",
  "SELECT * FROM rooms WHERE LOWER(name) LIKE '%2%' AND LOWER(name) LIKE '%v%'",
  "SELECT * FROM rooms WHERE LOWER(name) LIKE '%r%' AND LOWER(name) LIKE '%v%' AND LOWER(name) LIKE '%2%'",
];

patterns.forEach((query, index) => {
  db.query(query, [], (err, results) => {
    if (err) {
      console.error(`❌ Error with pattern ${index + 1}:`, err.message);
    } else {
      console.log(`\n📋 Pattern ${index + 1} results:`);
      if (results.length === 0) {
        console.log("   No matches");
      } else {
        results.forEach((room) => {
          console.log(`   - "${room.name}" (ID: ${room.id}, Image: ${room.image_url ? '✅' : '❌'})`);
        });
      }
    }
    
    if (index === patterns.length - 1) {
      console.log("\n✅ Search complete!");
      process.exit(0);
    }
  });
});

