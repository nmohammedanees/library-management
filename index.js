const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
app.use(express.json({ extended: false }));
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "librarymanagementsystem",
});
const PORT = 3000;

app.get("/books", (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? `WHERE Title LIKE '%${search}%' OR Author LIKE '%${search}%' OR Subject LIKE '%${search}%'`
    : "";
  const query = `SELECT * FROM books ${searchCondition} LIMIT ${limit} OFFSET ${offset}`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM books ${searchCondition}`;
      connection.query(countQuery, (countErr, countResults) => {
        if (countErr) {
          console.error("Error counting books:", countErr);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          const totalCount = countResults[0].count;
          const totalPages = Math.ceil(totalCount / limit);
          res.status(200).json({ books: results, totalPages });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
