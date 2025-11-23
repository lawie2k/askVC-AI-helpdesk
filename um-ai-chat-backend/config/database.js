const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection pool failed:", err.message);
  } else {
    console.log("✅ MySQL connection pool created successfully!");
    connection.release();
  }
});

module.exports = db;


