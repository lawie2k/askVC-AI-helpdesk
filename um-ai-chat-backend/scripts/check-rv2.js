const db = require("../config/database");

console.log("🔍 Checking RV2 room in database...\n");

// Check for RV2 in various formats
const queries = [
  { name: "RV2 (exact)", query: "SELECT * FROM rooms WHERE LOWER(name) LIKE '%rv2%'" },
  { name: "RV 2 (with space)", query: "SELECT * FROM rooms WHERE LOWER(name) LIKE '%rv 2%'" },
  { name: "RV2 (case insensitive)", query: "SELECT * FROM rooms WHERE LOWER(name) = 'rv2'" },
  { name: "All rooms with RV", query: "SELECT * FROM rooms WHERE LOWER(name) LIKE '%rv%'" },
];

let completed = 0;

queries.forEach(({ name, query }) => {
  db.query(query, [], (err, results) => {
    if (err) {
      console.error(`❌ Error checking ${name}:`, err.message);
    } else {
      console.log(`\n📋 ${name}:`);
      if (results.length === 0) {
        console.log("   No results found");
      } else {
        results.forEach((room) => {
          console.log(`   - ID: ${room.id}`);
          console.log(`     Name: "${room.name}"`);
          console.log(`     Type: ${room.type}`);
          console.log(`     Floor: ${room.floor}`);
          console.log(`     Image URL: ${room.image_url ? `✅ ${room.image_url}` : "❌ NULL/EMPTY"}`);
          console.log(`     Building ID: ${room.building_id || "NULL"}`);
          console.log("");
        });
      }
    }
    
    completed++;
    if (completed === queries.length) {
      console.log("\n✅ Check complete!");
      process.exit(0);
    }
  });
});

