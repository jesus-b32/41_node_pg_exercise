const express = require('express');
const db = require("../db");
const ExpressError = require('../expressError');

const router = new express.Router();


/**GET /companies : Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name FROM companies`);
        return res.json({companies: results.rows});
    } catch (err) {
        return next(err);
    }
});



/**GET /companies/[code] : Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
 * If the company given cannot be found, this should return a 404 status response.
 */
router.get("/:code", async function (req, res, next) {
    try {
        const companyResult = await db.query(
            `SELECT code, name, description 
            FROM companies
            WHERE code=$1`, [req.params.code]);

        const invoiceResult = await db.query(
            `SELECT id
                FROM invoices
                WHERE comp_code = $1`,
            [req.params.code]
        );

        if (Object.keys(companyResult.rows).length === 0) {
            throw new ExpressError('The company code entered cannot be found.', 404);
        }

        const company = companyResult.rows[0];
        const invoices = invoiceResult.rows;

        // add invoices to object key and use map to only include invoice id's
        company.invoices = invoices.map(inv => inv.id);

        return res.json({"company": company});
    } catch (err) {
        return next(err);
    }
});



/** Adds a company. Needs to be given JSON like: {code, name, description}
 * Returns obj of new company:  {company: {code, name, description}}
 */
router.post("/", async function (req, res, next) {
    try {
        const { code, name, description } = req.body;
        const result = await db.query(
                `INSERT INTO companies (code, name, description) 
                VALUES ($1, $2, $3)
                RETURNING code, name, description`,
                [code, name, description]
        );

        return res.status(201).json({company: result.rows[0]});
    } catch (err) {
        return next(err);
    }
});


/** Edit existing company. Should return 404 if company cannot be found.
 * Needs to be given JSON like: {name, description} 
 * Returns update company object: {company: {code, name, description}}
 */
router.patch("/:code", async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const result = await db.query(
                `UPDATE companies SET name=$1, description=$2
                WHERE code = $3
                RETURNING code, name, description`,
            [name, description, req.params.code]
        );

        if (Object.keys(result.rows).length === 0) {
            throw new ExpressError('The company code entered cannot be found.', 404);
        }

        return res.json({company: result.rows[0]});
    } catch (err) {
        return next(err);
    }
});



/** Deletes company. Should return 404 if company cannot be found.
 * Returns {status: "deleted"} */
router.delete("/:code", async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM companies 
            WHERE code = $1`,
            [req.params.code]
        );

        if (result.rowCount === 0) {
            throw new ExpressError('The company code entered cannot be found.', 404);
        }

        return res.json({status: "Deleted"});
    }catch (err) {
        return next(err);
    }
});



module.exports = router;