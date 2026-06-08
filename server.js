const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "ns95.dailysieure.com",
  user: "tdlsrhnuesite_vip",
  password: "tdlsrhnuesite_vip",
  database: "tdlsrhnuesite_vip",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// test DB ngay khi start
db.getConnection((err, conn) => {
  if (err) {
    console.log("❌ MYSQL ERROR:", err.message);
  } else {
    console.log("✅ MYSQL CONNECTED");
    conn.release();
  }
});

app.get("/", (req, res) => {
  res.json({ msg: "LMS Server Running" });
});

// GLOBAL ERROR SAFE RESPONSE
function safeQuery(sql, params, res, success) {
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log("SQL ERROR:", err);
      return res.status(500).json({
        msg: "Database error",
        error: err.code
      });
    }
    success(rows);
  });
}

// STUDENTS
app.get("/api/students", (req, res) => {
  safeQuery(
    "SELECT id, full_name, class_name FROM users WHERE role='student'",
    [],
    res,
    (rows) => res.json(rows)
  );
});

// SCORES
app.get("/api/scores/:uid/:sem", (req, res) => {
  safeQuery(
    "SELECT * FROM scores WHERE user_id=? AND semester=?",
    [req.params.uid, req.params.sem],
    res,
    (rows) => {
      const result = rows.map(x => ({
        ...x,
        total:
          x.attendance * 0.1 +
          x.mid * 0.3 +
          x.final * 0.6
      }));
      res.json(result);
    }
  );
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
