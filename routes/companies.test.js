process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testData;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amd', 'Advanced Microparts', 'Computer Parts') RETURNING code, name, description`);
  testData = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('Get a list of all companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [[testData]] });
  });

  test('Get a single company', async () => {
    const res = await request(app).get(`/companies/${testData.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testData });
  });

  test('Respond 404 with unknown company code', async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /companies', () => {
  test('Create a company', async () => {
    const res = await request(app).post(`/companies`).send({ code: 'jest', name: 'Testing Library', description: 'testing node.js code' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ company: { code: 'jest', name: 'Testing Library', description: 'testing node.js code' } });
  });
});

describe('PATCH /companies/:code', () => {
  test('Update a current company', async () => {
    const res = await request(app).patch(`/companies/${testData.code}`).send({ name: 'New Company', description: 'Test jest company' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: { code: testData.code, name: 'New Company', description: 'Test jest company' } });
  });

  test('Respond 404 with unknown company code', async () => {
    const res = await request(app).patch(`/companies/0`).send({ name: 'New Company', description: 'Test jest company' });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /companies/:code', () => {
  test('Deletes a single company', async () => {
    const res = await request(app).delete(`/companies/${testData.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Company Deleted' });
  });
});
