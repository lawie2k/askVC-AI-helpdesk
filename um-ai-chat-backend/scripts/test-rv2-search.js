const { searchDatabase } = require("../services/ai-search");

console.log("🧪 Testing RV2 search...\n");

const testQuestions = [
  "where is RV2",
  "show me RV2",
  "RV2",
  "rv2",
  "RV 2",
  "rv 2"
];

testQuestions.forEach(async (question, index) => {
  console.log(`\n${index + 1}. Testing: "${question}"`);
  try {
    const results = await searchDatabase(question);
    const roomResults = results.find(r => r.table === 'rooms');
    if (roomResults && roomResults.data.length > 0) {
      console.log(`   ✅ Found ${roomResults.data.length} room(s):`);
      roomResults.data.forEach(room => {
        console.log(`      - "${room.name}" (ID: ${room.id})`);
        console.log(`        Image: ${room.image_url ? '✅ ' + room.image_url.substring(0, 50) + '...' : '❌ None'}`);
        console.log(`        Relevance: ${room.relevance_score || 'N/A'}`);
        console.log(`        Match Type: ${room.match_type || 'N/A'}`);
      });
    } else {
      console.log(`   ❌ No rooms found`);
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
  
  if (index === testQuestions.length - 1) {
    setTimeout(() => process.exit(0), 1000);
  }
});

