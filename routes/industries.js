const express = require('express');
const db = require("../db");
const ExpressError = require('../expressError');
// const slugify = require("slugify");

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



/** Adds a company. Needs to be given JSON like: {name, description}
 * Returns obj of new company:  {company: {code, name, description}}
 */
router.post("/", async function (req, res, next) {
    try {
        const { name, description } = req.body;
        const code = slugify(name, {lower: true, remove: /[*+~.()'"!:@]/g});
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
// router.patch("/:code", async function (req, res, next) {
//     try {
//         const { name, description } = req.body;
//         const result = await db.query(
//                 `UPDATE companies SET name=$1, description=$2
//                 WHERE code = $3
//                 RETURNING code, name, description`,
//             [name, description, req.params.code]
//         );

//         if (Object.keys(result.rows).length === 0) {
//             throw new ExpressError('The company code entered cannot be found.', 404);
//         }

//         return res.json({company: result.rows[0]});
//     } catch (err) {
//         return next(err);
//     }
// });



/** Deletes company. Should return 404 if company cannot be found.
 * Returns {status: "deleted"} */
// router.delete("/:code", async function (req, res, next) {
//     try {
//         const result = await db.query(
//             `DELETE FROM companies 
//             WHERE code = $1`,
//             [req.params.code]
//         );

//         if (result.rowCount === 0) {
//             throw new ExpressError('The company code entered cannot be found.', 404);
//         }

//         return res.json({status: "Deleted"});
//     }catch (err) {
//         return next(err);
//     }
// });



module.exports = router;