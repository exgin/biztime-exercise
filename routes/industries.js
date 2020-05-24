const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({ industries: [results.rows] });
  } catch (error) {
    return next(error);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `
    SELECT i.code, i.industry, c.code
    FROM industries AS i 
    LEFT JOIN industry_company AS ic
    ON i.code = ic.ind_code
    LEFT JOIN companies AS c
    ON c.code = ic.comp_code
    WHERE i.code = $1`,
      [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find industry code: ${code}`, 404);
    }

    return res.json({ industry_comp: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { industry, code } = req.body;
    const results = await db.query(`INSERT INTO industries (industry, code) VALUES ($1, $2) RETURNING industry, code`, [industry, code]);
    return res.json({ industry: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
