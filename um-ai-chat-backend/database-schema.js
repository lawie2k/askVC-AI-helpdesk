const db = require("./database");

// Ensure database schema: add rooms.status if missing
function ensureRoomsStatusColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'status'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.status:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query("ALTER TABLE rooms ADD COLUMN status VARCHAR(50) DEFAULT 'Vacant'", (alterErr) => {
          if (alterErr) {
            console.warn('Failed to add rooms.status column:', alterErr.message);
          } else {
            console.log('✅ Added rooms.status column');
          }
        });
      }
    });
  } catch (e) {
    console.warn('Error checking rooms.status:', e.message);
  }
}

// Ensure rooms has type column
function ensureRoomsTypeColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'type'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.type:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query("ALTER TABLE rooms ADD COLUMN type VARCHAR(50) DEFAULT 'Lecture'", (alterErr) => {
          if (alterErr) {
            console.warn('Failed to add rooms.type column:', alterErr.message);
          } else {
            console.log('✅ Added rooms.type column');
          }
        });
      }
    });
  } catch (e) {
    console.warn('Error checking rooms.type:', e.message);
  }
}

// Ensure created_at column exists for a table
function ensureCreatedAtColumn(tableName) {
  try {
    db.query(`SHOW COLUMNS FROM ${tableName} LIKE 'created_at'`, (err, results) => {
      if (err) {
        console.warn(`Schema check failed for ${tableName}.created_at:`, err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(
          `ALTER TABLE ${tableName} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
          (alterErr) => {
            if (alterErr) {
              console.warn(`Failed to add ${tableName}.created_at column:`, alterErr.message);
            } else {
              console.log(`✅ Added ${tableName}.created_at column`);
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn(`Error checking ${tableName}.created_at:`, e.message);
  }
}

// Ensure rooms has building_id column and foreign key relationship
function ensureRoomsBuildingIdColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'building_id'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.building_id:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(
          "ALTER TABLE rooms ADD COLUMN building_id INT NULL AFTER location",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add rooms.building_id column:', alterErr.message);
            } else {
              console.log('✅ Added rooms.building_id column');
              // Add foreign key constraint
              db.query(
                "ALTER TABLE rooms ADD CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL ON UPDATE CASCADE",
                (fkErr) => {
                  if (fkErr) {
                    console.warn('Failed to add rooms.building_id foreign key:', fkErr.message);
                  } else {
                    console.log('✅ Added rooms.building_id foreign key constraint');
                  }
                }
              );
            }
          }
        );
      } else {
        // Check if foreign key exists
        db.query(
          "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'rooms' AND COLUMN_NAME = 'building_id' AND CONSTRAINT_NAME != 'PRIMARY'",
          (fkErr, fkResults) => {
            if (!fkErr && (!fkResults || fkResults.length === 0)) {
              db.query(
                "ALTER TABLE rooms ADD CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL ON UPDATE CASCADE",
                (addFkErr) => {
                  if (addFkErr) {
                    console.warn('Failed to add rooms.building_id foreign key:', addFkErr.message);
                  } else {
                    console.log('✅ Added rooms.building_id foreign key constraint');
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Error checking rooms.building_id:', e.message);
  }
}

// Ensure buildings table exists
function ensureBuildingsTable() {
  try {
    db.query("SHOW TABLES LIKE 'buildings'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for buildings table:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(`
          CREATE TABLE buildings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `, (createErr) => {
          if (createErr) {
            console.warn('Failed to create buildings table:', createErr.message);
          } else {
            console.log('✅ Created buildings table');
          }
        });
      }
    });
  } catch (e) {
    console.warn('Error checking buildings table:', e.message);
  }
}

// Ensure offices has building_id column and foreign key relationship
function ensureOfficesBuildingIdColumn() {
  try {
    db.query("SHOW COLUMNS FROM offices LIKE 'building_id'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for offices.building_id:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(
          "ALTER TABLE offices ADD COLUMN building_id INT NULL AFTER location",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add offices.building_id column:', alterErr.message);
            } else {
              console.log('✅ Added offices.building_id column');
              // Add foreign key constraint
              db.query(
                "ALTER TABLE offices ADD CONSTRAINT fk_offices_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL ON UPDATE CASCADE",
                (fkErr) => {
                  if (fkErr) {
                    console.warn('Failed to add offices.building_id foreign key:', fkErr.message);
                  } else {
                    console.log('✅ Added offices.building_id foreign key constraint');
                  }
                }
              );
            }
          }
        );
      } else {
        // Check if foreign key exists
        db.query(
          "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'offices' AND COLUMN_NAME = 'building_id' AND CONSTRAINT_NAME != 'PRIMARY'",
          (fkErr, fkResults) => {
            if (!fkErr && (!fkResults || fkResults.length === 0)) {
              db.query(
                "ALTER TABLE offices ADD CONSTRAINT fk_offices_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL ON UPDATE CASCADE",
                (addFkErr) => {
                  if (addFkErr) {
                    console.warn('Failed to add offices.building_id foreign key:', addFkErr.message);
                  } else {
                    console.log('✅ Added offices.building_id foreign key constraint');
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Error checking offices.building_id:', e.message);
  }
}

// Ensure rooms has floor column
function ensureRoomsFloorColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'floor'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.floor:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(
          "ALTER TABLE rooms ADD COLUMN floor VARCHAR(50) NULL AFTER building_id",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add rooms.floor column:', alterErr.message);
            } else {
              console.log('✅ Added rooms.floor column');
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Error checking rooms.floor:', e.message);
  }
}

// Ensure offices has floor column
function ensureOfficesFloorColumn() {
  try {
    db.query("SHOW COLUMNS FROM offices LIKE 'floor'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for offices.floor:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        db.query(
          "ALTER TABLE offices ADD COLUMN floor VARCHAR(50) NULL AFTER building_id",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add offices.floor column:', alterErr.message);
            } else {
              console.log('✅ Added offices.floor column');
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Error checking offices.floor:', e.message);
  }
}

// Remove location column from buildings table
function removeBuildingsLocationColumn() {
  try {
    db.query("SHOW COLUMNS FROM buildings LIKE 'location'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for buildings.location:', err.message);
        return;
      }
      if (results && results.length > 0) {
        db.query(
          "ALTER TABLE buildings DROP COLUMN location",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to remove buildings.location column:', alterErr.message);
            } else {
              console.log('✅ Removed buildings.location column');
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Error checking buildings.location:', e.message);
  }
}

// Initialize all database schema functions
function initializeDatabaseSchema() {
  console.log('🔧 Initializing database schema...');
  ensureRoomsStatusColumn();
  ensureRoomsTypeColumn();
  ensureBuildingsTable();
  ensureRoomsBuildingIdColumn();
  ensureOfficesBuildingIdColumn();
  ensureRoomsFloorColumn();
  ensureOfficesFloorColumn();
  removeBuildingsLocationColumn();
  // Ensure created_at exists on frequently reported tables
  ensureCreatedAtColumn('rooms');
  ensureCreatedAtColumn('offices');
  ensureCreatedAtColumn('departments');
  console.log('✅ Database schema initialization complete');
}

module.exports = {
  initializeDatabaseSchema,
  ensureRoomsStatusColumn,
  ensureRoomsTypeColumn,
  ensureBuildingsTable,
  ensureRoomsBuildingIdColumn,
  ensureOfficesBuildingIdColumn,
  ensureRoomsFloorColumn,
  ensureOfficesFloorColumn,
  removeBuildingsLocationColumn
};
