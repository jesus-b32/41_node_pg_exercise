const db = require("../db");

async function testData() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM industries");
    await db.query("DELETE FROM companies_industries");

    // This operation is typically performed after truncating or deleting data to ensure consistent ID assignment in subsequent inserts.
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`INSERT INTO companies (code, name, description)
                        VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
                            ('ibm', 'IBM', 'Big blue.')`);

    await db.query(
            `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
            VALUES ('apple', 100, false, '2024-06-21', null),
                    ('apple', 200, false, '2024-06-21', null),
                    ('apple', 300, true, '2024-06-21', '2024-06-28'),
                    ('ibm', 400, false, '2024-06-21', null)`);

    await db.query(`INSERT INTO industries (code, industry)
                    VALUES ('acct', 'Accounting'),
                            ('it', 'Information Technology'),
                            ('ops', 'Operations')`);

    await db.query(`INSERT INTO companies_industries (comp_code, indust_code)
                    VALUES ('apple', 'acct'),
                            ('apple', 'it'),
                            ('ibm', 'acct'),
                            ('ibm', 'it'),
                            ('apple', 'ops')`);
}


module.exports = testData;