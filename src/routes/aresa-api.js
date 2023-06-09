const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// 데이터베이스 연결 설정
const db = new sqlite3.Database(
  "./data/mydatabase.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the database.");
    }
  }
);

// 테이블 생성
db.run(
  `CREATE TABLE IF NOT EXISTS historical_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER
  )`
);

db.run(
  `CREATE TABLE IF NOT EXISTS future_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER
  )`
);

// GET /aresa-api/historical_prices
router.get("/historical_prices", (req, res) => {
  db.all("SELECT price FROM historical_prices", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({
        error: "Failed to fetch historical prices from the database.",
      });
    } else {
      const prices = rows.map((row) => row.price);
      res.json({ value: prices });
    }
  });
});

// POST /aresa-api/historical_prices
router.post("/historical_prices", (req, res) => {
  const { price } = req.body;
  if (typeof price !== "number") {
    res.status(400).json({ error: "Invalid price value." });
    return;
  }

  db.run(
    "INSERT INTO historical_prices (price) VALUES (?)",
    [price],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({
          error: "Failed to insert historical price into the database.",
        });
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// GET /aresa-api/future_prices
router.get("/future_prices", (req, res) => {
  db.all("SELECT price FROM future_prices", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Failed to fetch future prices from the database." });
    } else {
      const prices = rows.map((row) => row.price);
      res.json({ value: prices });
    }
  });
});

// POST /aresa-api/future_prices
router.post("/future_prices", (req, res) => {
  const { price } = req.body;
  if (typeof price !== "number") {
    res.status(400).json({ error: "Invalid price value." });
    return;
  }

  db.run(
    "INSERT INTO future_prices (price) VALUES (?)",
    [price],
    function (err) {
      if (err) {
        console.error(err.message);
        res
          .status(500)
          .json({ error: "Failed to insert future price into the database." });
      } else {
        res.sendStatus(200);
      }
    }
  );
});

module.exports = router;
