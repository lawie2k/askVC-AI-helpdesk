const db = require("./database");

// ============================================================================
// MAIN SEARCH FUNCTION - This is the main function that coordinates everything
// ============================================================================
async function searchDatabase(question) {
  return new Promise((resolve) => {
    const searchResults = [];
    let completedSearches = 0;

    // ========================================================================
    //  ANALYZE THE QUESTION - What is the user asking about?
    // ========================================================================
    const isRules = isRulesQuestion(question);
    const isProfessors = isProfessorsQuestion(question);
    const isBuildings = isBuildingsQuestion(question);
    const isPrograms = isProgramsQuestion(question);
    const isOffices = isOfficesQuestion(question);
    const isRooms = isRoomsQuestion(question);

    // Extract specific information from the question
    const targetDepartment = extractDepartmentFromQuestion(question);
    const targetRoomNumber = extractRoomNumber(question);

    // ========================================================================
    //  DEFINE WHICH DATABASE TABLES TO SEARCH
    // ========================================================================
    const tablesToSearch = [
      { name: "departments", priority: 1 },  // Search departments first
      { name: "professors", priority: 2 },   // Then professors
      { name: "buildings", priority: 3 },    // Then buildings
      { name: "rooms", priority: 4 },        // Then rooms
      { name: "offices", priority: 5 },      // Then offices
      { name: "rules", priority: 6 },        // Then rules
      { name: "settings", priority: 7 }      // Finally settings
    ];

    if (tablesToSearch.length === 0) {
      resolve(searchResults);
      return;
    }

    // ========================================================================
    //  EXTRACT KEYWORDS FOR BETTER SEARCH MATCHING
    // ========================================================================
    const keywords = extractKeywords(question);
    const searchTerms = [question.toLowerCase(), ...keywords];

    // ========================================================================
    //  SEARCH EACH DATABASE TABLE BASED ON QUESTION TYPE
    // ========================================================================
    tablesToSearch.forEach((tableInfo) => {
      const table = tableInfo.name;
      
      // ====================================================================
      // RULES SEARCH - When user asks about campus rules/policies
      // ====================================================================
      if (isRules && table === 'rules') {
        console.log("🔍 Searching RULES table...");
        db.query('SELECT *, "rules_query" as match_type FROM rules', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for rules questions
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // ====================================================================
      // PROFESSORS SEARCH - When user asks about faculty/professors
      // ====================================================================
      if (isProfessors && table === 'professors') {
        console.log("👨‍🏫 Searching PROFESSORS table...");
        
        if (targetDepartment) {
          // Search professors by specific department (e.g., "BSIT professors")
          console.log(`   → Filtering by department: ${targetDepartment}`);
          db.query(
            `SELECT p.*, d.short_name AS department, "professors_query" as match_type
             FROM professors p
             LEFT JOIN departments d ON p.department_id = d.id
             WHERE (
               p.program LIKE ? OR d.short_name LIKE ? OR d.name LIKE ?
             )`,
            [`%${targetDepartment}%`, `%${targetDepartment}%`, `%${targetDepartment}%`],
            (err, results) => {
              if (!err && results.length > 0) {
                console.log(`   ✅ Found ${results.length} professors in ${targetDepartment}`);
                const scoredResults = results.map(result => ({
                  ...result,
                  relevance_score: 100 // High relevance for specific department
                }));
                searchResults.push({
                  table: table,
                  data: scoredResults,
                  priority: tableInfo.priority
                });
              }

              completedSearches++;
              if (completedSearches === tablesToSearch.length) {
                const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
                resolve(finalResults);
              }
            }
          );
        } else {

          // Search all professors
          console.log("   → Getting all professors (limited to 25)");
          db.query(
            `SELECT p.*, d.short_name AS department, "professors_query" as match_type
             FROM professors p
             LEFT JOIN departments d ON p.department_id = d.id
             LIMIT 25`,
            (err, results) => {
              if (!err && results.length > 0) {
                console.log(`   ✅ Found ${results.length} professors total`);
                const scoredResults = results.map(result => ({
                  ...result,
                  relevance_score: 80 // Lower relevance for general search
                }));
                searchResults.push({
                  table: table,
                  data: scoredResults,
                  priority: tableInfo.priority
                });
              }

              completedSearches++;
              if (completedSearches === tablesToSearch.length) {
                const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
                resolve(finalResults);
              }
            }
          );
        }
        return;
      }

      // ====================================================================
      // PROGRAMS SEARCH - When user asks about available programs/courses
      // ====================================================================
      if (isPrograms && table === 'professors') {
        console.log("📚 Searching PROGRAMS from professors table...");
        db.query(
          `SELECT DISTINCT TRIM(program) AS program, 'programs_query' as match_type
           FROM professors
           WHERE program IS NOT NULL AND program <> ''
           ORDER BY program`,
          (err, results) => {
            if (!err && results.length > 0) {
              console.log(`   ✅ Found ${results.length} programs`);
              const scoredResults = results.map(result => ({
                ...result,
                relevance_score: 100 // High relevance for programs questions
              }));
              searchResults.push({
                table: table,
                data: scoredResults,
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {
              const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
              resolve(finalResults);
            }
          }
        );
        return;
      }

      // ====================================================================
      // BUILDINGS SEARCH - When user asks about campus buildings
      // ====================================================================
      if (isBuildings && table === 'buildings') {
        console.log("🏢 Searching BUILDINGS table...");
        db.query('SELECT *, "buildings_query" as match_type FROM buildings', (err, results) => {
          if (!err && results.length > 0) {
            console.log(`   ✅ Found ${results.length} buildings`);
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for buildings questions
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // ====================================================================
      // OFFICES SEARCH - When user asks about office locations
      // ====================================================================
      if (isOffices && table === 'offices') {
        console.log("🏢 Searching OFFICES table...");
        db.query(`
          SELECT o.*, b.name as building_name, "office_query" as match_type 
          FROM offices o 
          LEFT JOIN buildings b ON o.building_id = b.id
        `, (err, results) => {
          if (!err && results.length > 0) {
            console.log(`   ✅ Found ${results.length} offices`);
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for offices questions
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // ====================================================================
      // ROOMS SEARCH - When user asks about room locations
      // ====================================================================
      if (isRooms && table === 'rooms') {
        console.log("🚪 Searching ROOMS table...");
        
        if (targetRoomNumber) {
          // Search for specific room number (e.g., "Where is room 301?")
          console.log(`   → Looking for specific room: ${targetRoomNumber}`);
          db.query(`
            SELECT r.*, b.name as building_name, "room_query" as match_type 
            FROM rooms r 
            LEFT JOIN buildings b ON r.building_id = b.id 
            WHERE r.name LIKE ? OR r.name = ?
          `, [`%${targetRoomNumber}%`, targetRoomNumber], (err, results) => {
            if (!err && results.length > 0) {
              console.log(`   ✅ Found room ${targetRoomNumber}`);
              const scoredResults = results.map(result => ({
                ...result,
                relevance_score: 100 // High relevance for specific room queries
              }));
              searchResults.push({
                table: table,
                data: scoredResults,
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {
              const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
              resolve(finalResults);
            }
          });
        } else {
          // Get all rooms if no specific room number mentioned
          console.log("   → Getting all rooms");
          db.query(`
            SELECT r.*, b.name as building_name, "room_query" as match_type 
            FROM rooms r 
            LEFT JOIN buildings b ON r.building_id = b.id
          `, (err, results) => {
            if (!err && results.length > 0) {
              console.log(`   ✅ Found ${results.length} rooms total`);
              const scoredResults = results.map(result => ({
                ...result,
                relevance_score: 100
              }));
              searchResults.push({
                table: table,
                data: scoredResults,
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {
              const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
              resolve(finalResults);
            }
          });
        }
        return;
      }
      
      // ====================================================================
      // GENERAL SEARCH - For any other questions not covered above
      // ====================================================================
      console.log(`🔍 General search in ${table} table...`);
      
      // Create multiple search queries for better results
      const queries = [
        // Exact phrase search
        `SELECT *, 'exact' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        
        // Individual keyword search
        `SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        
        // Partial word search
        `SELECT *, 'partial' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`
      ];

      // Add individual keyword searches
      keywords.forEach(keyword => {
        queries.push(`SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`);
      });

      let tableResults = [];
      let queryCount = 0;

      queries.forEach((query, index) => {
        let searchTerm;
        
        if (index === 0) {
          // Exact phrase search
          searchTerm = `%${question.toLowerCase()}%`;
        } else if (index === 1) {
          // Keyword search - use first meaningful keyword
          searchTerm = `%${keywords[0] || question.toLowerCase()}%`;
        } else if (index === 2) {
          // Partial word search - use first word longer than 2 chars
          const firstWord = question.toLowerCase().split(' ').find(word => word.length > 2);
          searchTerm = `%${firstWord || question.toLowerCase()}%`;
        } else {
          // Individual keyword search - try each keyword separately
          const keywordIndex = index - 3;
          const keyword = keywords[keywordIndex] || question.toLowerCase();
          searchTerm = `%${keyword}%`;
        }

        db.query(query, [searchTerm], (err, results) => {
          if (!err && results.length > 0) {
            // Add relevance score based on match type and table priority
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: calculateRelevance(result, question, tableInfo.priority, index)
            }));
            tableResults = tableResults.concat(scoredResults);
          }

          queryCount++;
          if (queryCount === queries.length) {
            // Remove duplicates and sort by relevance
            const uniqueResults = removeDuplicates(tableResults);
            const sortedResults = uniqueResults.sort((a, b) => b.relevance_score - a.relevance_score);

            if (sortedResults.length > 0) {
              searchResults.push({
                table: table,
                data: sortedResults.slice(0, 5), // Limit to top 5 results per table
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {
              // Sort results by table priority and relevance
              const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
              resolve(finalResults);
            }
          }
        });
      });
    });
  });
}

// ============================================================================
// HELPER FUNCTIONS - These functions help analyze and process questions
// ============================================================================

// ========================================================================
// KEYWORD EXTRACTION - Extract important words from user questions
// ========================================================================
function extractKeywords(question) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'where', 'when', 'why', 'how', 'who', 'which', 'list', 'show', 'all'];
  
  // Handle common abbreviations and synonyms
  const synonyms = {
    'profs': 'professor',
    'prof': 'professor',
    'teachers': 'professor',
    'instructors': 'professor',
    'faculty': 'professor',
    'rooms': 'room',
    'offices': 'office',
    'departments': 'department',
    'rules': 'rule'
  };
  
  let keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => synonyms[word] || word); // Replace with synonyms if available
  
  // If no keywords found, try with shorter words
  if (keywords.length === 0) {
    keywords = question.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .map(word => synonyms[word] || word);
  }
  
  return keywords.slice(0, 5); // Take top 5 keywords
}

// ========================================================================
// QUESTION TYPE DETECTION - Determine what the user is asking about
// ========================================================================


function isRulesQuestion(question) {
  const rulesKeywords = ['rules', 'rule', 'regulations', 'policies', 'guidelines', 'code', 'conduct'];
  const questionLower = question.toLowerCase();
  return rulesKeywords.some(keyword => questionLower.includes(keyword));
}


function isProfessorsQuestion(question) {
  const profKeywords = ['professor', 'professors', 'profs', 'teacher', 'teachers', 'instructor', 'instructors', 'faculty'];
  const q = question.toLowerCase();
  return profKeywords.some(k => q.includes(k));
}


function isBuildingsQuestion(question) {
  const buildingKeywords = ['building', 'buildings', 'structure', 'structures', 'campus building', 'campus buildings'];
  const q = question.toLowerCase();
  return buildingKeywords.some(k => q.includes(k));
}


function isProgramsQuestion(question) {
  const programKeywords = ['programs', 'courses', 'offerings', 'offered programs', 'available programs'];
  const q = question.toLowerCase();
  return programKeywords.some(k => q.includes(k));
}


function isOfficesQuestion(question) {
  const officeKeywords = ['office', 'offices', 'sao', 'student affairs', 'registrar', 'cashier', 'clinic', 'library', 'faculty', 'where is', 'location'];
  const q = question.toLowerCase();
  return officeKeywords.some(k => q.includes(k));
}


function isRoomsQuestion(question) {
  const roomKeywords = ['room', 'rooms', 'where is', 'location of', 'find room'];
  const q = question.toLowerCase();
  return roomKeywords.some(k => q.includes(k));
}

// ========================================================================
// DATA EXTRACTION - Extract specific information from questions
// ========================================================================

// Extract room number
function extractRoomNumber(question) {
  const roomMatch = question.match(/room\s+(\d+)/i);
  if (roomMatch) {
    return roomMatch[1];
  }
  
  // Also try to match just numbers that might be room numbers
  const numberMatch = question.match(/\b(\d{3,4})\b/);
  if (numberMatch) {
    return numberMatch[1];
  }
  
  return null;
}

// Try to extract department from question

function extractDepartmentFromQuestion(question) {
  const q = question.toLowerCase();
  // Common department aliases
  if (q.includes('bsit') || q.includes(' it ') || q.endsWith(' it') || q.startsWith('it ') || q.includes('information technology') || q.includes('in it') || q.includes('it department')) {
    return 'BSIT';
  }
  if (q.includes('bscs') || q.includes(' cs ') || q.endsWith(' cs') || q.startsWith('cs ') || q.includes('computer science')) {
    return 'BSCS';
  }
  if (q.includes('it?') || q.includes('it,')) {
    return 'BSIT';
  }
  return null;
}

// ========================================================================
// DATABASE UTILITIES - Helper functions for database operations
// ========================================================================


function getSearchableColumns(table) {
  const columnMap = {
    departments: "name, short_name",
    professors: "name, position, email, program",
    buildings: "name",
    rooms: "name, floor, status, type",
    offices: "name, floor",
    rules: "description",
    settings: "key_name, value",
  };

  return columnMap[table] || "name, description";
}


function calculateRelevance(result, question, tablePriority, queryIndex) {
  let score = 100 - (tablePriority * 10); // Base score from table priority
  

  if (result.match_type === 'exact') score += 30;
  else if (result.match_type === 'keyword') score += 20;
  else if (result.match_type === 'partial') score += 10;
  
  // Boost score for early query matches
  score += Math.max(0, 20 - queryIndex * 2);
  
  return Math.max(0, score);
}

// prevents showing same data twice
function removeDuplicates(results) {
  const seen = new Set();
  return results.filter(result => {
    const key = `${result.id || result.name || JSON.stringify(result)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

module.exports = {
  searchDatabase,
  extractRoomNumber,
  extractDepartmentFromQuestion,
};
