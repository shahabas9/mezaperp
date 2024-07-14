import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';

const { Pool } = pkg;

const app = express();
const port = 3000;
const host = '0.0.0.0';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure the PostgreSQL client
const pool = new Pool({
  user: 'shahabas',
  host: 'localhost',
  database: 'development',
  password: 'mezab',
  port: 5432,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'Dashboard.html'));
});

//Customer page

// Handle form submission
app.post('/add-customer', async (req, res) => {
  const { customer_name, mobile_no, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customer (customer_name, mobile_no, email) VALUES ($1, $2, $3) RETURNING *',
      [customer_name, mobile_no, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle editing customer details
app.put('/edit-customer/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_name, mobile_no, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE customer SET customer_name = $1, mobile_no = $2, email = $3 WHERE customer_id = $4 RETURNING *',
      [customer_name, mobile_no, email, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle deleting customer
app.delete('/delete-customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customer WHERE customer_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Fetch all customers or search customers by name
app.get('/customers', async (req, res) => {
  const searchQuery = req.query.search ? `%${req.query.search}%` : '%';
  try {
    const result = await pool.query(
      'SELECT * FROM customer WHERE customer_name ILIKE $1',
      [searchQuery]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Fetch customers
app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT customer_id, customer_name FROM customer');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//customer project page

// Fetch quotation ID for a given customer
app.get('/customers/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query('SELECT quotation_id FROM project WHERE customer_id = $1', [customerId]);
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle form submission for adding projects
app.post('/add-project', async (req, res) => {
  const { customer_id, project_name, project_type, category, subcategory,sales_person,contact } = req.body;
  try {
    const projectResult = await pool.query(
      'INSERT INTO project (customer_id, project_name, project_type, category, subcategory,salesperson_name,salesperson_contact) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_id, project_name, project_type, category, subcategory,sales_person,contact]
    );

    const project = projectResult.rows[0];
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle editing project details
app.put('/edit-project/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_id, project_name, project_type, category, subcategory,sales_person,contact } = req.body;
  try {
    const result = await pool.query(
      'UPDATE project SET customer_id = $1, project_name = $2, project_type = $3, category = $4, subcategory = $5, salesperson_name = $6, salesperson_contact = $7 WHERE project_id = $8 RETURNING *',
      [customer_id, project_name, project_type, category, subcategory,sales_person,contact, id]
    );

    const project = result.rows[0];
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle deleting project
app.delete('/delete-project/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM project WHERE project_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Fetch all projects

// Fetch all projects or search projects by quotation ID
app.get('/projects', async (req, res) => {
  const quotationId = req.query.quotation_id;
  let query = `
      SELECT p.*, c.customer_name
      FROM project p
      JOIN customer c ON p.customer_id = c.customer_id
  `;
  let params = [];

  if (quotationId) {
      query += ' WHERE p.quotation_id = $1';
      params = [quotationId];
  }

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});


// Fetch project data for editing
app.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM project WHERE project_id = $1', [projectId]);
    const project = result.rows[0];
    if (!project) {
      // If project with the provided ID doesn't exist, send a 404 response
      return res.status(404).send('Project not found');
    }
    // If project exists, send it as JSON
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// supply addition data page

/// Endpoint to get customers with "Supply" projects
app.get('/api/customers', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'Supply'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Endpoint to get quotations by customer ID and "Supply" category
app.get('/api/quotations/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND category = 'Supply'
    `, [customerId]);
    console.log('Fetched quotations for customer', customerId, ':', quotationResult.rows); // Debugging
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.post('/api/supply', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO supply (customer_id, quotation_id, type, model, ton, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
              item.type,
              item.model,
              item.ton,
              item.quantity,
              item.unit_price,
              item.total_price,
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});


// supply quotation generation page
app.get('/api/quotations_supply', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'Supply'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Endpoint to fetch data for a specific quotation


app.get('/api/duct_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS customer_attn,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.project_name, p.project_type, p.category,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.model,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supply s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'duct'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/vrf_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.model,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supply s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'vrf'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/floorstand_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.model,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supply s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'floorstand'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for floorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/packageunit_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supply s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'package_units'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for floorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_si', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'Supply & Installation'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/api/quotations_si/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND category = 'Supply & Installation'
    `, [customerId]);
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/api/supply_si', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO supplyandinstallation (customer_id, quotation_id, type, ton, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
              item.type,
              item.ton,
              item.quantity,
              item.unit_price,
              item.total_price,
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_supplyinst', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'Supply & Installation'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/floorstandsi_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
      supplyandinstallation s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'floorstand'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for floorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/cassettesi_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supplyandinstallation s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'cassette'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for cassette template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/ductsi_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supplyandinstallation s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'duct'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/splitsi_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supplyandinstallation s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'split'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for split template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/splitfloorsi_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.ton,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        supplyandinstallation s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'split&floorstand'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for splitfloorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_vi', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'villa'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/api/quotations_vi/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND category = 'villa'
    `, [customerId]);
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/api/villa', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO villa (customer_id, quotation_id, location, area, type, ton, quantity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
              item.location,
              item.area,
              item.type,
              item.ton,
              item.quantity
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_villa', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.category = 'villa'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/splitvilla_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.area,
        s.type,
        s.ton,
        s.quantity,
        s.location
      
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        villa s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'split'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/ductvilla_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.area,
        s.type,
        s.ton,
        s.quantity,
        s.location
      
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        villa s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'duct'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/duct_split_villa_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.area,
        s.type,
        s.ton,
        s.quantity,
        s.location
      
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        villa s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'duct&split'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_amc', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'AMC'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/api/quotations_amc/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND subcategory = 'AMC'
    `, [customerId]);
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/api/amc', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO amc (customer_id, quotation_id, type, quantity)
          VALUES ($1, $2, $3, $4)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
             
              item.type,
             
              item.quantity
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_amc', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'AMC'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/amc_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.quantity
    
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        amc s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'AMC'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for amc template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_boq', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'BOQ'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/api/quotations_boq/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND subcategory = 'BOQ'
    `, [customerId]);
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/api/boq', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO boq (customer_id, quotation_id, supply_amount, installation_amount,total_amount)
          VALUES ($1, $2, $3, $4, $5)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
             
              item.supply,
              item.installation,
              item.total_price
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_boq', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'BOQ'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/boq_template', async (req, res) => {
  const { quotationId } = req.query;

  if (!quotationId) {
    return res.status(400).json({ error: 'Quotation ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.supply_amount,
        s.installation_amount,
        s.total_amount
    
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        boq s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'BOQ'
    `, [quotationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for amc template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_sp', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'Spare_Parts'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Endpoint to get quotations by customer ID and "Supply" category
app.get('/api/quotations_sp/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND subcategory = 'Spare_Parts'
    `, [customerId]);
    console.log('Fetched quotations for customer', customerId, ':', quotationResult.rows); // Debugging
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.post('/api/spare', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO spare_parts (customer_id, quotation_id, type, model, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
              item.type,
              item.model,
              item.quantity,
              item.unit_price,
              item.total_price,
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_sp', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'Spare_Parts'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/spareparts_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.model,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        spare_parts s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'Spare_Parts'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for floorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/customers_fans', async (req, res) => {
  try {
    const customerResult = await pool.query(`
      SELECT DISTINCT c.customer_id, c.customer_name
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'Fan'
    `);
    res.json(customerResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Endpoint to get quotations by customer ID and "Supply" category
app.get('/api/quotations_fans/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const quotationResult = await pool.query(`
      SELECT quotation_id
      FROM project
      WHERE customer_id = $1 AND subcategory = 'Fan'
    `, [customerId]);
    console.log('Fetched quotations for customer', customerId, ':', quotationResult.rows); // Debugging
    res.json(quotationResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.post('/api/fans', async (req, res) => {
  const { customer_id, quotation_id, supply_data } = req.body;

  console.log('Received payload:', req.body); // Debugging output

  try {
      await pool.query('BEGIN');

      const insertSupplyQuery = `
          INSERT INTO fans (customer_id, quotation_id, type, location, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of supply_data) {
          const values = [
              customer_id,
              quotation_id,
              item.type,
              item.location,
              item.quantity,
              item.unit_price,
              item.total_price
          ];

          console.log('Inserting item:', values); // Debugging output
          await pool.query(insertSupplyQuery, values);
      }

      await pool.query('COMMIT');
      res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to submit data' });
  }
});

app.get('/api/quotations_fan', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, p.quotation_id, p.subcategory
      FROM customer c
      JOIN project p ON c.customer_id = p.customer_id
      WHERE p.subcategory = 'Fan'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/fan_template', async (req, res) => {
  const { quotationId } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        p.project_name AS project_name,
        c.customer_name,
        c.mobile_no,
        c.email,
        p.quotation_id,
        p.salesperson_name,
        p.salesperson_contact,
        s.type,
        s.location,
        s.quantity,
        s.unit_price,
        s.total_price
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      JOIN
        fans s ON p.quotation_id = s.quotation_id
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'Fan'
    `, [quotationId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for floorstand template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
