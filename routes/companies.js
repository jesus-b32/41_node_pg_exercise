const express = require('express');
const db = require("../db");
const ExpressError = require('../expressError');
const router = new express.Router();


/**GET /companies : Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name, description FROM companies`);
        return res.json({companies: results.rows});
    } catch (err) {
        return next(err);
    }
});



/**GET /companies/[code] : Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response.
 */
router.get("/:code", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name, description 
            FROM companies
            WHERE code=$1`, [req.params.code]);

        if (Object.keys(results.rows).length === 0) {
            throw new ExpressError('The company code entered cannot be found.', 404);
        }

        return res.json({company: results.rows[0]});
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



module.exports = router;