const mysql = require("mysql2");

// Use connection pool instead of single connection for concurrent requests
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "imforsaken1",
  database: process.env.DB_NAME || "askVC",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20, // Max 20 concurrent connections
  queueLimit: 0, // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection pool failed:", err.message);
  } else {
    console.log("✅ MySQL connection pool created successfully!");
    connection.release(); // Release the test connection
  }
});

module.exports = db;


