const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: [results.rows] });
  } catch (error) {
    return next(error);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find company code: ${code}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({ company: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:code', async (req, res, next) => {
  try {
    let code = slugify(name, { lower: true });
    const { name, description } = req.body;
    const results = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`, [name, description, code]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find company code: ${code}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find company: ${code}, to delete`, 404);
    }
    return res.json({ message: 'Company Deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
