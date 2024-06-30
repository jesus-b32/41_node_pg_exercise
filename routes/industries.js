const express = require('express');
const db = require("../db");
const ExpressError = require('../expressError');

const router = new express.Router();


/**GET /industries : Returns list of industries, like {industries: [{code,industry, companies}, ...]} */
router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
            `SELECT i.code, i.industry, string_agg(c.name, ',' ORDER BY c.name) AS companies
            FROM industries AS i
            LEFT JOIN companies_industries AS ci ON i.code = ci.indust_code
            LEFT JOIN companies AS c ON ci.comp_code = c.code
            GROUP BY i.code, i.industry`);

        return res.json({industries: results.rows});
    } catch (err) {
        return next(err);
    }
});



/** Adds an industry. Needs to be given JSON like: {code,industry}
 * Returns obj of new company:  {industry: {code, industry}}
 */
router.post("/", async function (req, res, next) {
    try {
        const { code, industry } = req.body;
        const result = await db.query(
                `INSERT INTO industries (code, industry) 
                VALUES ($1, $2)
                RETURNING code, industry`,
                [code, industry]
        );

        return res.status(201).json({industry: result.rows[0]});
    } catch (err) {
        return next(err);
    }
});


/** Associate an industry to a company. Needs to be given JSON like: {industryCode, companyCode}
 * Returns obj of new company:  {assoication: {companyCode,industryCode}}
 */
router.post("/associate", async function (req, res, next) {
    try {
        const { industryCode, companyCode } = req.body;
        const result = await db.query(
                `INSERT INTO companies_industries (comp_code, indust_code) 
                VALUES ($1, $2)
                RETURNING comp_code, indust_code`,
                [companyCode, industryCode]
        );

        return res.status(201).json({association: result.rows[0]});
    } catch (err) {
        return next(err);
    }
});



module.exports = router;