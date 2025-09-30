const db = require("./database");

// Function to search database for relevant information
async function searchDatabase(question) {
  return new Promise((resolve) => {
    const searchResults = [];
    let completedSearches = 0;

    // Check if this is a rules, professors, buildings, or rooms question
    const isRules = isRulesQuestion(question);
    const isProfessors = isProfessorsQuestion(question);
    const isBuildings = isBuildingsQuestion(question);
    const isRooms = isRoomsQuestion(question);
    const targetDepartment = extractDepartmentFromQuestion(question);
    const targetRoomNumber = extractRoomNumber(question);

    // Tables to search with priority
    const tablesToSearch = [
      { name: "departments", priority: 1 },
      { name: "professors", priority: 2 },
      { name: "buildings", priority: 3 },
      { name: "rooms", priority: 4 },
      { name: "offices", priority: 5 },
      { name: "rules", priority: 6 },
      { name: "settings", priority: 7 }
    ];

    if (tablesToSearch.length === 0) {
      resolve(searchResults);
      return;
    }

    // Extract keywords from question for better matching
    const keywords = extractKeywords(question);
    const searchTerms = [question.toLowerCase(), ...keywords];

    tablesToSearch.forEach((tableInfo) => {
      const table = tableInfo.name;
      
      // Special handling for rules questions
      if (isRules && table === 'rules') {
        // For rules questions, get all rules
        db.query('SELECT *, "rules_query" as match_type FROM rules', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for rules when asking about rules
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            // Sort results by table priority and relevance
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // Special handling for professors questions
      if (isProfessors && table === 'professors') {
        if (targetDepartment) {
          // Narrow to professors in the target department (e.g., BSIT)
          db.query(
            'SELECT *, "professors_query" as match_type FROM professors WHERE department LIKE ? OR program LIKE ?',
            [`%${targetDepartment}%`, `%${targetDepartment}%`],
            (err, results) => {
              if (!err && results.length > 0) {
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
            }
          );
        } else {
          // If no department specified, return all professors (limited)
          db.query(
            'SELECT *, "professors_query" as match_type FROM professors LIMIT 25',
            (err, results) => {
              if (!err && results.length > 0) {
                const scoredResults = results.map(result => ({
                  ...result,
                  relevance_score: 80
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

      // Special handling for buildings questions
      if (isBuildings && table === 'buildings') {
        // For buildings questions, get all buildings
        db.query('SELECT *, "buildings_query" as match_type FROM buildings', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for buildings when asking about buildings
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            // Sort results by table priority and relevance
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // Special handling for rooms questions
      if (isRooms && table === 'rooms') {
        if (targetRoomNumber) {
          // Search for specific room number
          db.query(`
            SELECT r.*, b.name as building_name, "room_query" as match_type 
            FROM rooms r 
            LEFT JOIN buildings b ON r.building_id = b.id 
            WHERE r.name LIKE ? OR r.name = ?
          `, [`%${targetRoomNumber}%`, targetRoomNumber], (err, results) => {
            if (!err && results.length > 0) {
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
          db.query(`
            SELECT r.*, b.name as building_name, "room_query" as match_type 
            FROM rooms r 
            LEFT JOIN buildings b ON r.building_id = b.id
          `, (err, results) => {
            if (!err && results.length > 0) {
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

// Extract keywords from question for better search
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

// Check if question is asking about rules specifically
function isRulesQuestion(question) {
  const rulesKeywords = ['rules', 'rule', 'regulations', 'policies', 'guidelines', 'code', 'conduct'];
  const questionLower = question.toLowerCase();
  return rulesKeywords.some(keyword => questionLower.includes(keyword));
}

// Check if question is asking about professors/faculty
function isProfessorsQuestion(question) {
  const profKeywords = ['professor', 'professors', 'profs', 'teacher', 'teachers', 'instructor', 'instructors', 'faculty'];
  const q = question.toLowerCase();
  return profKeywords.some(k => q.includes(k));
}

// Check if question is asking about buildings
function isBuildingsQuestion(question) {
  const buildingKeywords = ['building', 'buildings', 'structure', 'structures', 'campus building', 'campus buildings'];
  const q = question.toLowerCase();
  return buildingKeywords.some(k => q.includes(k));
}

// Check if question is asking about specific rooms
function isRoomsQuestion(question) {
  const roomKeywords = ['room', 'rooms', 'where is', 'location of', 'find room'];
  const q = question.toLowerCase();
  return roomKeywords.some(k => q.includes(k));
}

// Extract room number from question (e.g., "room 301" -> "301")
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

// Try to extract department from question (maps to DB department values)
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

// Helper function to get searchable columns for each table
function getSearchableColumns(table) {
  const columnMap = {
    departments: "name, head, location",
    professors: "name, position, email, department, program",
    buildings: "name",
    rooms: "name, location, status, type",
    offices: "name, location",
    rules: "description",
    settings: "setting_name, setting_value, description",
  };

  return columnMap[table] || "name, description";
}

// Calculate relevance score for search results
function calculateRelevance(result, question, tablePriority, queryIndex) {
  let score = 100 - (tablePriority * 10); // Base score from table priority
  
  // Boost score based on match type
  if (result.match_type === 'exact') score += 30;
  else if (result.match_type === 'keyword') score += 20;
  else if (result.match_type === 'partial') score += 10;
  
  // Boost score for early query matches
  score += Math.max(0, 20 - queryIndex * 2);
  
  return Math.max(0, score);
}

// Remove duplicate results based on ID
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
  extractKeywords,
  isRulesQuestion,
  isProfessorsQuestion,
  isBuildingsQuestion,
  isRoomsQuestion,
  extractRoomNumber,
  extractDepartmentFromQuestion,
  getSearchableColumns,
  calculateRelevance,
  removeDuplicates
};
