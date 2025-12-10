const db = require("../config/database");

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
    const isOfficers = isOfficersQuestion(question);


    const targetDepartment = extractDepartmentFromQuestion(question);
    const targetOrganization = extractOrganizationFromQuestion(question);

    // ========================================================================
    //  DEFINE WHICH DATABASE TABLES TO SEARCH
    // ========================================================================
    const tablesToSearch = [
      { name: "departments", priority: 1 },    // Search departments first
      { name: "professors", priority: 2 },     // Then professors
      { name: "officers", priority: 3 },       // Then officers (student organizations)
      { name: "buildings", priority: 4 },      // Then buildings
      { name: "rooms", priority: 5 },          // Then rooms
      { name: "offices", priority: 6 },        // Then offices
      { name: "rules", priority: 7 },          // Campus rules
      { name: "vision_mission", priority: 8 }, // Vision & mission
      { name: "announcements", priority: 9 },  // School events, enrollment, schedules
      { name: "campus_info", priority: 10 },    // Services & other info
      { name: "settings", priority: 11 }       // Finally settings
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
        return;
      }

      if (table === 'vision_mission') {
        console.log("📜 Fetching VISION & MISSION entries...");
        db.query('SELECT *, "vision_mission_query" as match_type FROM vision_mission', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 95
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

      if (table === 'campus_info') {
        console.log("ℹ️ Fetching CAMPUS INFO entries...");
        db.query('SELECT *, "campus_info_query" as match_type FROM campus_info', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 90
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

      // ====================================================================
      // OFFICERS SEARCH - When user asks about student officers
      // ====================================================================
      if (isOfficers && table === 'officers') {
        console.log("👥 Searching OFFICERS table...");
        
        if (targetOrganization) {
          console.log(`   → Filtering by organization: ${targetOrganization}`);
          db.query(
            `SELECT *, "officers_query" as match_type
             FROM officers
             WHERE organization = ?
             ORDER BY position_order ASC, id ASC`,
            [targetOrganization],
            (err, results) => {
              if (!err && results.length > 0) {
                console.log(`   ✅ Found ${results.length} officers in ${targetOrganization}`);
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
          console.log("   → Getting all officers (limited to 50)");
          db.query(
            `SELECT *, "officers_query" as match_type
             FROM officers
             ORDER BY organization ASC, position_order ASC, id ASC
             LIMIT 50`,
            (err, results) => {
              if (!err && results.length > 0) {
                console.log(`   ✅ Found ${results.length} officers total`);
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
        return;
      }

      // ====================================================================
      // ROOMS SEARCH - When user asks about room locations
      // ====================================================================
      if (isRooms && table === 'rooms') {
        console.log("🚪 Searching ROOMS table...");
        const q = question.toLowerCase();
        
        // Extract specific room identifier (e.g., "comlab 1", "room 301", "avr", "laboratory")
        let roomIdentifier = null;
        let roomType = null;
        let comlabAltIdentifier = null; // For names like "Com Lab V1"
        let usedSpecificLabPhrase = false; // e.g. "electrical laboratory"
        
        // Check for specific room types (avr, laboratory, lecture, etc.)
        const roomTypes = [
          { keywords: ['avr', 'audio visual', 'audio-visual'], name: 'avr' },
          { keywords: ['laboratory', 'lab'], name: 'laboratory' },
          { keywords: ['lecture', 'lecture room'], name: 'lecture' },
          { keywords: ['comlab', 'computer lab', 'computer laboratory'], name: 'comlab' },
        ];
        
        for (const type of roomTypes) {
          if (type.keywords.some(keyword => q.includes(keyword))) {
            roomType = type.name;
            break;
          }
        }
        
        // Check for "comlab" with number (e.g., "comlab 1", "comlab1", "comlab 10")
        const comlabMatch = q.match(/\bcomlab\s*(\d+)\b/i);
        if (comlabMatch) {
          roomIdentifier = `comlab ${comlabMatch[1]}`.toLowerCase();
          // Special-case mapping: "comlab 1/2/3" → "Com Lab V1/V2/V3"
          comlabAltIdentifier = `com lab v${comlabMatch[1]}`.toLowerCase();
        }
        
        // Check for letter-number patterns (e.g., "RV1", "RV2", "RV3", "AV1", "B2")
        // This should catch "RV2", "rv2", "RV 2", "rv 2", etc.
        if (!roomIdentifier) {
          const letterNumberMatch = q.match(/\b([a-z]{1,4})\s*(\d+)\b/i);
          if (letterNumberMatch) {
            // Match patterns like "RV1", "RV 1", "rv1", "RV2", "RV 2", "rv2", etc.
            const letters = letterNumberMatch[1].toLowerCase();
            const number = letterNumberMatch[2];
            roomIdentifier = `${letters}${number}`.toLowerCase();
            // Also try with space: "rv 1" → "rv1", "rv 2" → "rv2"
            const altIdentifier = `${letters} ${number}`.toLowerCase();
            // Store both formats for matching
            comlabAltIdentifier = altIdentifier;
            console.log(`   🔍 Detected letter-number pattern: "${roomIdentifier}" (also trying "${altIdentifier}")`);
          }
        }
        
        // Check for "room" with number (e.g., "room 301", "room301")
        if (!roomIdentifier) {
          const roomNumberMatch = q.match(/\broom\s*(\d{3,4})\b/i);
          if (roomNumberMatch) {
            roomIdentifier = `room ${roomNumberMatch[1]}`.toLowerCase();
          }
        }
        
        // Check for standalone 3-4 digit numbers (e.g., "301", "301A")
        if (!roomIdentifier) {
          const standaloneNumberMatch = q.match(/\b(\d{3,4}[a-z]?)\b/i);
          if (standaloneNumberMatch) {
            roomIdentifier = standaloneNumberMatch[1].toLowerCase();
          }
        }
        
        // If we have a "X laboratory/lab" phrase (e.g. "electrical laboratory"),
        // use the full phrase as identifier so we don't mix different labs.
        if (!roomIdentifier) {
          const labPhraseMatch = q.match(/\b([a-z]+)\s+(laboratory|lab)\b/i);
          if (labPhraseMatch && labPhraseMatch[1]) {
            roomIdentifier = `${labPhraseMatch[1]} ${labPhraseMatch[2]}`.toLowerCase();
            usedSpecificLabPhrase = true;
          }
        }

        // Check for generic room names (e.g., "collaboration room", "meeting room", "study room")
        // This should catch room names that don't match the specific patterns above
        if (!roomIdentifier) {
          // Look for patterns like "X room" where X is a descriptive word
          const genericRoomMatch = q.match(/\b([a-z]+)\s+room\b/i);
          if (genericRoomMatch && genericRoomMatch[1] && genericRoomMatch[1].length > 3) {
            // Extract the descriptive word (e.g., "collaboration" from "collaboration room")
            roomIdentifier = genericRoomMatch[1].toLowerCase();
            console.log(`   🔍 Detected generic room name: "${roomIdentifier}"`);
          }
        }

        // If we have a room type but still no identifier, use the type as identifier
        if (!roomIdentifier && roomType) {
          roomIdentifier = roomType;
        }
        
        let query = `
          SELECT r.*, b.name as building_name, "room_query" as match_type 
          FROM rooms r 
          LEFT JOIN buildings b ON r.building_id = b.id
        `;
        
        const queryParams = [];
        if (roomIdentifier) {
          // Search for rooms that match the identifier in their name or type
          // plus a special alternate form for Com Lab V1/V2/V3 or letter-number patterns
          if (comlabAltIdentifier) {
            // For letter-number patterns (like RV2), search for both "rv2" and "rv 2"
            // Also search for the pattern without spaces in the database name
            query += ` WHERE (LOWER(r.name) LIKE ? OR LOWER(r.type) LIKE ? OR LOWER(r.name) LIKE ? OR LOWER(REPLACE(r.name, ' ', '')) LIKE ?)`;
            queryParams.push(`%${roomIdentifier}%`, `%${roomIdentifier}%`, `%${comlabAltIdentifier}%`, `%${roomIdentifier.replace(/\s+/g, '')}%`);
          } else {
            // For other patterns, also try without spaces and with different variations
            // This helps find rooms like "RV2" when searching for "rv2" or "RV 2"
            const identifierNoSpaces = roomIdentifier.replace(/\s+/g, '');
            query += ` WHERE (LOWER(r.name) LIKE ? OR LOWER(r.type) LIKE ? OR LOWER(REPLACE(r.name, ' ', '')) LIKE ? OR LOWER(REPLACE(r.name, ' ', '')) = ?)`;
            queryParams.push(`%${roomIdentifier}%`, `%${roomIdentifier}%`, `%${identifierNoSpaces}%`, identifierNoSpaces);
          }
        }
        
        db.query(query, queryParams, (err, results) => {
          if (!err && results.length > 0) {
            console.log(`   ✅ Found ${results.length} rooms`);
            // Log details about found rooms
            results.forEach((room) => {
              console.log(`      - "${room.name}" (ID: ${room.id}, Image: ${room.image_url ? '✅' : '❌'}, Relevance: ${room.relevance_score || 'N/A'})`);
            });
            
            // Score results: exact match gets highest score, partial match gets lower
            const scoredResults = results.map(result => {
              const roomNameLower = (result.name || '').toLowerCase().trim();
              const roomTypeLower = (result.type || '').toLowerCase().trim();
              let score = 50; // Base score for partial match
              
              if (roomIdentifier) {
                // Normalize both for comparison (remove extra spaces, handle variations)
                const normalizedIdentifier = roomIdentifier.replace(/\s+/g, ' ').trim();
                const normalizedRoomName = roomNameLower.replace(/\s+/g, ' ').trim();
                
                // Extract just the number from identifier for comparison
                const identifierNumber = normalizedIdentifier.replace(/[^0-9]/g, '');
                const roomNameNumber = normalizedRoomName.replace(/[^0-9]/g, '');
                
                // Remove all spaces for comparison
                const identifierNoSpaces = normalizedIdentifier.replace(/\s+/g, '').toLowerCase();
                const roomNameNoSpaces = normalizedRoomName.replace(/\s+/g, '').toLowerCase();
                
                // Extract letters and numbers separately
                const identifierLetters = normalizedIdentifier.replace(/[^a-z]/g, '').toLowerCase();
                const identifierNum = normalizedIdentifier.replace(/[^0-9]/g, '');
                const roomNameLetters = normalizedRoomName.replace(/[^a-z]/g, '').toLowerCase();
                const roomNameNum = normalizedRoomName.replace(/[^0-9]/g, '');
                
                // Special handling for COM LAB variants (e.g., "comlab v3", "comlab 3", "com lab v3")
                if (identifierLetters.includes('comlab')) {
                  const idNoV = normalizedIdentifier.replace(/v(?=\d)/ig, '').replace(/\s+/g, '');
                  const roomNoV = normalizedRoomName.replace(/v(?=\d)/ig, '').replace(/\s+/g, '');
                  if (idNoV === roomNoV || roomNoV.includes(idNoV)) {
                    score = 100;
                  }
                }

                // Exact match (handles "comlab 1" vs "comlab1" vs "ComLab 1", "RV1" vs "rv1" vs "RV 1")
                if (normalizedRoomName === normalizedIdentifier || 
                    roomNameNoSpaces === identifierNoSpaces) {
                  score = 100; // Perfect exact match
                }
                // Letter-number pattern match (e.g., "RV1" matches "RV 1" or "rv1", "RV2" matches "RV 2" or "rv2")
                else if (/^[a-z]+\d+$/i.test(identifierNoSpaces)) {
                  // If letters and numbers match exactly (e.g., "RV2" matches "RV 2" or "rv2")
                  if (identifierLetters === roomNameLetters && identifierNum === roomNameNum) {
                    score = 100; // Perfect match for letter-number patterns
                  } else if (identifierNum === roomNameNum && 
                            (roomNameLetters.includes(identifierLetters) || identifierLetters.includes(roomNameLetters))) {
                    score = 95; // Same number, similar letters
                  }
                }
                // Same number match (e.g., "comlab 1" matches "ComLab 1" or "comlab1")
                else if (identifierNumber && roomNameNumber === identifierNumber) {
                  // Check if the prefix matches (comlab, room, etc.)
                  const identifierPrefix = normalizedIdentifier.replace(/[0-9\s]/g, '').toLowerCase();
                  const roomNamePrefix = normalizedRoomName.replace(/[0-9\s]/g, '').toLowerCase();
                  if (identifierPrefix && (roomNamePrefix.includes(identifierPrefix) || 
                      identifierPrefix.includes(roomNamePrefix))) {
                    score = 95; // Very close match (same number, similar prefix)
                  } else {
                    score = 80; // Same number but different prefix
                  }
                }
                // Room type match (e.g., "avr" matches room with type "AVR")
                else if (roomType && (roomTypeLower === roomType || roomTypeLower.includes(roomType))) {
                  score = 90; // Room type match
                }
                // Partial match (contains the identifier)
                else if (normalizedRoomName.includes(normalizedIdentifier) || 
                         normalizedIdentifier.includes(normalizedRoomName)) {
                  score = 75; // Partial match
                }
                // Contains the number
                else if (identifierNumber && roomNameNumber.includes(identifierNumber)) {
                  score = 60; // Number match but different format
                }
              }
              
              return {
                ...result,
                relevance_score: score
              };
            });
            
            // Sort by relevance score (highest first)
            scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);
            
            // Only return the top result if we have a specific identifier
            const finalResults = roomIdentifier && scoredResults.length > 0 
              ? [scoredResults[0]] // Only the best match
              : scoredResults; // All results if no specific identifier
            
            searchResults.push({
              table: table,
              data: finalResults,
              priority: tableInfo.priority
            });
          } else if (!err && results.length === 0 && usedSpecificLabPhrase && roomIdentifier) {
            // The user asked for a very specific lab (e.g. "electrical laboratory")
            // but we found no matching room. Tell the AI clearly so it doesn't
            // incorrectly map to some other laboratory like Physics Lab.
            searchResults.push({
              table: table,
              data: [
                {
                  name: null,
                  type: null,
                  building_name: null,
                  match_type: "no_room_match",
                  requested_identifier: roomIdentifier,
                  message: `There is NO room in the database that matches "${roomIdentifier}". Do NOT assume it is another laboratory like Physics Lab.`
                }
              ],
              priority: tableInfo.priority
            });
          } else if (!err && results.length === 0 && roomIdentifier) {
            // Generic case: user asked for a specific room/identifier (e.g. "ComLab 5" or
            // "Room 999") that does not exist in the database. Make this explicit so the
            // AI does not guess another room.
            console.log(`   ⚠️ No room found matching "${roomIdentifier}"`);
            searchResults.push({
              table: table,
              data: [
                {
                  name: null,
                  type: null,
                  building_name: null,
                  match_type: "no_room_match",
                  requested_identifier: roomIdentifier,
                  message: `There is NO room in the database that matches "${roomIdentifier}". Do NOT guess or substitute a different room.`
                }
              ],
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
        const q = question.toLowerCase();
        
        // Extract specific office name from question
        let officeIdentifier = null;
        const officeKeywords = [
          { keywords: ['library', 'librarian'], name: 'library' },
          { keywords: ['cashier', 'cash'], name: 'cashier' },
          { keywords: ['faculty', 'faculty room'], name: 'faculty' },
          { keywords: ['registrar', "registrar's"], name: 'registrar' },
          { keywords: ['sao', 'student affairs', 'student affairs office'], name: 'sao' },
          { keywords: ['clinic', 'health', 'medical'], name: 'clinic' },
          { keywords: ['osa', 'office of student affairs'], name: 'osa' },
          { keywords: ['dean', "dean's office"], name: 'dean' },
          { keywords: ['guidance', 'guidance office', 'guidance counselor'], name: 'guidance' },
          // RAC office (e.g. "RAC office", "where is the RAC office")
          { keywords: ['rac', 'rac office'], name: 'rac' },
        ];
        
        // Find which office is mentioned in the question
        for (const office of officeKeywords) {
          if (office.keywords.some(keyword => q.includes(keyword))) {
            officeIdentifier = office.name;
            break;
          }
        }
        
        // Build search terms; for clinic, include common aliases like "health services"
        let query = `
          SELECT o.*, b.name as building_name, "office_query" as match_type 
          FROM offices o 
          LEFT JOIN buildings b ON o.building_id = b.id
        `;
        
        const queryParams = [];
        const searchTerms = [];
        if (officeIdentifier) {
          if (officeIdentifier === 'clinic') {
            searchTerms.push('clinic', 'health services', 'center of health services', 'health service', 'medical');
          } else {
            searchTerms.push(officeIdentifier);
          }
        }

        if (searchTerms.length > 0) {
          const whereClauses = searchTerms.map(() => `LOWER(o.name) LIKE ?`).join(' OR ');
          query += ` WHERE (${whereClauses})`;
          searchTerms.forEach(term => queryParams.push(`%${term}%`));
        }
        
        db.query(query, queryParams, (err, results) => {
          if (!err && results.length > 0) {
            console.log(`   ✅ Found ${results.length} offices`);
            
            // Score results: exact match gets highest score
            const scoredResults = results.map(result => {
              const officeNameLower = (result.name || '').toLowerCase().trim();
              let score = 50; // Base score for partial match

              if (searchTerms.length > 0) {
                const normalizedOfficeName = officeNameLower.replace(/\s+/g, ' ').trim();
                // Build a simple acronym from significant words (skip very short words like "of")
                const acronym = normalizedOfficeName
                  .split(/\s+/)
                  .filter(w => w.length > 1)
                  .map(w => w[0])
                  .join('')
                  .toLowerCase();

                for (const term of searchTerms) {
                  const normalizedIdentifier = term.toLowerCase().trim();
                  // Exact match variants
                  if (
                    normalizedOfficeName === normalizedIdentifier ||
                    normalizedOfficeName === `${normalizedIdentifier} office` ||
                    normalizedOfficeName === `${normalizedIdentifier} room`
                  ) {
                    score = 100;
                    break;
                  }
                  // Acronym match (e.g., "OSA" for "Office of Student Affairs")
                  if (acronym && normalizedIdentifier && acronym.includes(normalizedIdentifier)) {
                    score = Math.max(score, 100);
                    continue;
                  }
                  // Contains the identifier as a word
                  if (
                    normalizedOfficeName.includes(normalizedIdentifier) &&
                    (normalizedOfficeName.startsWith(normalizedIdentifier) ||
                      normalizedOfficeName.includes(` ${normalizedIdentifier} `) ||
                      normalizedOfficeName.includes(` ${normalizedIdentifier}`))
                  ) {
                    score = Math.max(score, 95);
                  } else if (normalizedOfficeName.includes(normalizedIdentifier)) {
                    score = Math.max(score, 75);
                  }
                }
              } else {
                // No specific identifier, give all results same score
                score = 50;
              }

              return {
                ...result,
                relevance_score: score
              };
            });
            
            // Sort by relevance score (highest first)
            scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);
            
            // Only return the top result if we have a specific identifier
            const finalResults = officeIdentifier && scoredResults.length > 0 
              ? [scoredResults[0]] // Only the best match
              : scoredResults; // All results if no specific identifier
            
            searchResults.push({
              table: table,
              data: finalResults,
              priority: tableInfo.priority
            });
          } else if (!err && results.length === 0 && officeIdentifier) {
            // The user asked for a specific office (e.g. "OSA office", "RAC office")
            // that does not exist in the database. Tell the AI explicitly so it does
            // NOT answer with some random other office.
            searchResults.push({
              table: table,
              data: [
                {
                  name: null,
                  floor: null,
                  building_name: null,
                  match_type: "no_office_match",
                  requested_identifier: officeIdentifier,
                  message: `There is NO office in the database that matches "${officeIdentifier}". Do NOT guess or substitute a different office.`
                }
              ],
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
      // GENERAL SEARCH - For any other questions not covered above
      // ====================================================================
      console.log(`🔍 General search in ${table} table...`);
      

      const queries = [

        `SELECT *, 'exact' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        

        `SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        

        `SELECT *, 'partial' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`
      ];


      keywords.forEach(keyword => {
        queries.push(`SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`);
      });

      let tableResults = [];
      let queryCount = 0;

      queries.forEach((query, index) => {
        let searchTerm;
        
        if (index === 0) {

          searchTerm = `%${question.toLowerCase()}%`;
        } else if (index === 1) {

          searchTerm = `%${keywords[0] || question.toLowerCase()}%`;
        } else if (index === 2) {

          const firstWord = question.toLowerCase().split(' ').find(word => word.length > 2);
          searchTerm = `%${firstWord || question.toLowerCase()}%`;
        } else {

          const keywordIndex = index - 3;
          const keyword = keywords[keywordIndex] || question.toLowerCase();
          searchTerm = `%${keyword}%`;
        }

        db.query(query, [searchTerm], (err, results) => {
          if (!err && results.length > 0) {

            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: calculateRelevance(result, question, tableInfo.priority, index)
            }));
            tableResults = tableResults.concat(scoredResults);
          }

          queryCount++;
          if (queryCount === queries.length) {

            const uniqueResults = removeDuplicates(tableResults);
            const sortedResults = uniqueResults.sort((a, b) => b.relevance_score - a.relevance_score);

            if (sortedResults.length > 0) {
              searchResults.push({
                table: table,
                data: sortedResults.slice(0, 5),
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {

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
  

  const synonyms = {
    'profs': 'professor',
    'prof': 'professor',
    'teachers': 'professor',
    'instructors': 'professor',
    'faculty': 'professor',
    'offices': 'office',
    'departments': 'department',
    'rules': 'rule'
  };
  
  let keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => synonyms[word] || word);
  

  if (keywords.length === 0) {
    keywords = question.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .map(word => synonyms[word] || word);
  }
  
  return keywords.slice(0, 5);
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
  const officeKeywords = ['office', 'offices', 'sao', 'student affairs', 'registrar', 'cashier', 'clinic', 'library', 'faculty', 'guidance'];
  const q = question.toLowerCase();
  return officeKeywords.some(k => q.includes(k));
}

function isRoomsQuestion(question) {
  const roomKeywords = ['room', 'rooms', 'classroom', 'classrooms', 'lecture', 'comlab', 'laboratory', 'lab'];
  const q = question.toLowerCase();
  // Also check for room numbers (e.g., "room 301", "301")
  const roomNumberPattern = /\b(room\s*)?\d{3,4}\b/i;
  // Check for letter-number patterns (e.g., "RV1", "RV2", "AV1")
  const letterNumberPattern = /\b[a-z]{1,4}\s*\d+\b/i;
  return roomKeywords.some(k => q.includes(k)) || roomNumberPattern.test(q) || letterNumberPattern.test(q);
}

function isOfficersQuestion(question) {
  const officerKeywords = ['officer', 'officers', 'president', 'vice president', 'secretary', 'treasurer', 'student leader', 'student leaders', 'student government', 'organization', 'organizations'];
  const q = question.toLowerCase();
  return officerKeywords.some(k => q.includes(k));
}


// ========================================================================
// DATA EXTRACTION - Extract specific information from questions
// ========================================================================




function extractDepartmentFromQuestion(question) {
  const q = question.toLowerCase();

  if (q.includes('bsit') || q.includes(' it ') || q.endsWith(' it') || q.startsWith('it ') || q.includes('information technology') || q.includes('in it') || q.includes('it department')) {
    return 'BSIT';
  }
  if (q.includes('bscs') || q.includes(' cs ') || q.endsWith(' cs') || q.startsWith('cs ') || q.includes('computer science') || q.includes('com sci') || q.includes('comsci')) {
    return 'BSCS';
  }
  if (q.includes('bsce') || q.includes(' ce ') || q.endsWith(' ce') || q.startsWith('ce ') || q.includes('computer engineering') || q.includes('com eng') || q.includes('comeng')) {
    return 'BSCE';
  }
  if (q.includes('it?') || q.includes('it,')) {
    return 'BSIT';
  }
  return null;
}

function extractOrganizationFromQuestion(question) {
  const q = question.toLowerCase();
  
  // Check for CODES
  if (q.includes('codes')) {
    return 'CODES';
  }
  // Check for CSIT
  if (q.includes('csit')) {
    return 'CSIT';
  }
  // Check for EESA
  if (q.includes('eesa')) {
    return 'EESA';
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
    officers: "name, position, organization",
    buildings: "name",
    rooms: "name, floor, type",
    offices: "name, floor, open_time, close_time, lunch_start, lunch_end",
    rules: "description",
    vision_mission: "description",
    announcements: "title, description",
    campus_info: "description",
    settings: "key_name, value",
  };

  return columnMap[table] || "name, description";
}


function calculateRelevance(result, question, tablePriority, queryIndex) {
  let score = 100 - (tablePriority * 10);
  

  if (result.match_type === 'exact') score += 30;
  else if (result.match_type === 'keyword') score += 20;
  else if (result.match_type === 'partial') score += 10;
  

  score += Math.max(0, 20 - queryIndex * 2);
  
  return Math.max(0, score);
}


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
  extractDepartmentFromQuestion,
};
