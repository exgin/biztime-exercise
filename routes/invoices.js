const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: [results.rows] });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code) WHERE id = $1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find invoice id: ${id}`, 404);
    }
    // get our usual data
    let data = results.rows[0];
    // extract the data we need
    let finalData = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({ invoice: finalData });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
    return res.json({ invoice: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let { amt, paid } = req.body;
    // if not paid, set to null, so we're going to start at null
    let paidDate = null;

    const paidResults = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);

    if (paidResults.rows.length === 0) {
      throw new ExpressError(`Invoice cannot be found :${id}`);
    }

    // set to the paid date
    const currentPaidDate = paidResults.rows[0].paid_date;

    // if unpaid, set paid_date to today
    if (!currentPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currentPaidDate;
    }

    const results = await db.query(`UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);

    return res.json({ invoice: results.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);

    if (results.rows.length === 0) {
      throw new ExpressError(`Cannot find invoice: ${id}, to delete`, 404);
    }
    return res.json({ message: 'Invoice deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
