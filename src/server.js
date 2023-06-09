const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");

// SQLite3 데이터베이스 연결 설정
const databaseFile = "./data/mydatabase.db";

// 기존 데이터베이스 파일 확인 후 삭제
if (fs.existsSync(databaseFile)) {
  fs.unlinkSync(databaseFile);
}

// 새로운 데이터베이스 파일 생성
const db = new sqlite3.Database(databaseFile, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// historical_prices 테이블 생성
db.run(`CREATE TABLE historical_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aptId INTEGER,
  year INTEGER,
  month INTEGER,
  price INTEGER
)`);

// future_prices 테이블 생성
db.run(`CREATE TABLE future_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aptId INTEGER,
  year INTEGER,
  month INTEGER,
  price INTEGER
)`);

// Body parsing 미들웨어 추가
app.use(express.json());
app.use(cors());

// 과거 시세 조회 API
app.get("/aresa-api/historical_prices", (req, res) => {
  const { aptId, year, monthStart, monthEnd } = req.query;

  db.all(
    "SELECT price FROM historical_prices WHERE aptId = ? AND year = ? AND month >= ? AND month <= ?",
    [aptId, year, monthStart, monthEnd],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const historicalPrices = rows.map((row) => row.price);
      const response = {
        value: historicalPrices,
      };
      res.json(response);
    }
  );
});

// 과거 시세 입력 API
app.post("/aresa-api/historical_prices", (req, res) => {
  const { aptId, year, monthStart, values } = req.body;

  const placeholders = values.map(() => "(?, ?, ?, ?)").join(",");
  const params = [];
  values.forEach((value, index) => {
    params.push(aptId, year, monthStart + index, value);
  });

  db.run(
    `INSERT INTO historical_prices (aptId, year, month, price) VALUES ${placeholders}`,
    params,
    function (err) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const response = {
        id: this.lastID,
        aptId,
        year,
        monthStart,
        values,
      };
      res.json(response);
    }
  );
});

// 전망 시세 조회 API
app.get("/aresa-api/future_prices", (req, res) => {
  const { aptId, year, monthStart, monthEnd } = req.query;

  db.all(
    "SELECT price FROM future_prices WHERE aptId = ? AND year = ? AND month >= ? AND month <= ?",
    [aptId, year, monthStart, monthEnd],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const futurePrices = rows.map((row) => row.price);
      const response = {
        value: futurePrices,
      };
      res.json(response);
    }
  );
});

// 전망 시세 입력 API
app.post("/aresa-api/future_prices", (req, res) => {
  const { aptId, year, monthStart, values } = req.body;

  const placeholders = values.map(() => "(?, ?, ?, ?)").join(",");
  const params = [];
  values.forEach((value, index) => {
    params.push(aptId, year, monthStart + index, value);
  });

  db.run(
    `INSERT INTO future_prices (aptId, year, month, price) VALUES ${placeholders}`,
    params,
    function (err) {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      const response = {
        id: this.lastID,
        aptId,
        year,
        monthStart,
        values,
      };
      res.json(response);
    }
  );
});

// 서버 시작
app.listen(3000, () => {
  console.log("Backend server is running on http://localhost:3000");
});
