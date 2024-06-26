/** Database setup for BizTime. */
const { Client } = require("pg");

let DB_URI;

//using enviromental variables for databasee url
if (process.env.NODE_ENV === "test") {
    DB_URI = process.env.DATABASE_TEST_URL;
} else {
    DB_URI = process.env.DATABASE_URL;
}

const db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;
