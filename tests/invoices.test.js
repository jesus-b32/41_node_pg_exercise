// connect to right DB --- set before loading db.js
require('dotenv').config()
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// file imports
const db = require("../db");
const app = require('../app');
const testData = require('./test_setup');


beforeEach(testData);

afterAll(async () => {
    // close db connection
    await db.end();
});

/** Return info on invoices: like {invoices: [{id, comp_code}, ...]} */
describe("GET /invoices", function() {
    test("Gets a list of invoices", async function() {
        const response = await request(app).get(`/invoices`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoices": [
                {
                    "id": 1,
                    "comp_code": "apple"
                },
                {
                    "id": 2,
                    "comp_code": "apple"
                },
                {
                    "id": 3,
                    "comp_code": "apple"
                },
                {
                    "id": 4,
                    "comp_code": "ibm"
                }
            ]
        });
    });
});


/** GET /invoices/[id] : Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
 */
describe("GET /invoices/:id", function() {
    test("Gets a single invoice", async function() {
        const response = await request(app).get(`/invoices/4`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoice": {
                "id": 4,
                "amt": 400,
                "paid": false,
                "add_date": "2024-06-21T07:00:00.000Z",
                "paid_date": null,
                "company": {
                    "code": "ibm",
                    "name": "IBM",
                    "description": "Big blue."
                }
            }
        });
    });

    test("Responds with 404 if can't find a company", async function() {
        const response = await request(app).get(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
    });
});


/** POST /invoices : Adds an invoice. Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
describe("POST /invoices", function() {
    test("Add a new invoice", async function() {
        const response = await request(app)
            .post(`/invoices`)
            .send({
                "comp_code": "ibm",
	            "amt": "50"
            });
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            "invoice": {
                "id": 5,
                "comp_code": "ibm",
                "amt": 50,
                "paid": false,
                "add_date": expect.any(String),
                "paid_date": null
            }
        });
    });
});


/** PUT /invoices/[id] : Updates an invoice. If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt} 
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
describe("PATCH /invoices/:id", function() {
    test("Update a single invoice", async function() {
        const response = await request(app)
            .patch(`/invoices/4`)
            .send({
                "amt": 1000
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoice": {
                "id": 4,
                "comp_code": "ibm",
                "amt": 1000,
                "paid": false,
                "add_date": "2024-06-21T07:00:00.000Z",
                "paid_date": null
            }
        });
    });

    test("Responds with 404 if can't find a invoice", async function() {
        const response = await request(app).patch(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
    });
});


/** DELETE /invoices/[id] : Deletes an invoice.If invoice cannot be found, returns a 404. 
 * Returns: {status: "deleted"} Also, one route from the previous part should be updated:
  */
describe("DELETE /invoices/:id", function() {
    test("Delete a single invoice", async function() {
        const response = await request(app)
            .delete(`/invoices/4`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "status": "Deleted"
        });
    });

    test("Responds with 404 if can't find a invoice", async function() {
        const response = await request(app).delete(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
    });
});