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
    // Check if a customer with the same name and mobile number already exists
    const existingCustomer = await pool.query(
      'SELECT * FROM customer WHERE customer_name = $1 AND mobile_no = $2',
      [customer_name, mobile_no]
    );

    if (existingCustomer.rows.length > 0) {
      // If customer exists, send an error response
      return res.status(400).json({ error: 'Customer with the same name and mobile number already exists.' });
    }

    // If the combination is unique, insert the new customer
    const result = await pool.query(
      'INSERT INTO customer (customer_name, mobile_no, email) VALUES ($1, $2, $3) RETURNING *',
      [customer_name, mobile_no, email]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database Insert Error:', err);
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
  const searchQuery = req.query.search || '';  // Default to an empty string if no search query is provided
  const searchBy = req.query.searchBy || 'customer_name'; // Default to 'customer_name'

  let query = '';
  let queryParams = [];

  if (searchQuery) {
    // When a search query is provided
    if (searchBy === 'customer_name') {
        query = 'SELECT * FROM customer WHERE customer_name ILIKE $1';
        queryParams = [`%${searchQuery}%`];
    } else if (searchBy === 'mobile_no') {
        query = 'SELECT * FROM customer WHERE mobile_no ILIKE $1';
        queryParams = [searchQuery];
    } else {
        return res.status(400).send('Invalid searchBy parameter');
    }
  } else {
    // When no search query is provided, return all customers
    query = 'SELECT * FROM customer';
  }

  // Log the search query and parameters
  console.log('Search Query:', searchQuery);
  console.log('Search By:', searchBy);
  console.log('Query:', query);
  console.log('Query Params:', queryParams);

  try {
      const result = await pool.query(query, queryParams);
      res.json(result.rows);
  } catch (err) {
      console.error('Database Query Error:', err);
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
  const { customer_id, project_name, project_type, category, subcategory,sales_person,contact,project_area } = req.body;
  try {
    

    const projectResult = await pool.query(
      'INSERT INTO project (customer_id, project_name, project_type, category, subcategory,salesperson_name,salesperson_contact,project_area) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [customer_id, project_name, project_type, category, subcategory,sales_person,contact,project_area]
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
  const { customer_id, project_name, project_type, category, subcategory,sales_person,contact,project_area } = req.body;
  try {
    const result = await pool.query(
      'UPDATE project SET customer_id = $1, project_name = $2, project_type = $3, category = $4, subcategory = $5, salesperson_name = $6, salesperson_contact = $7,project_area=$8 WHERE project_id = $9 RETURNING *',
      [customer_id, project_name, project_type, category, subcategory,sales_person,contact,project_area, id]
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



// Fetch all projects or search projects by quotation ID
app.get('/projects', async (req, res) => {
  const { quotation_id, customer_name, mobile_number } = req.query;
  let query = `
      SELECT p.*, c.customer_name, c.mobile_no
      FROM project p
      JOIN customer c ON p.customer_id = c.customer_id
  `;
  let params = [];

  if (quotation_id) {
      query += ' WHERE p.quotation_id ILIKE $1';
      params = [`%${quotation_id}%`];
  } else if (customer_name) {
      query += ' WHERE c.customer_name ILIKE $1';
      params = [`%${customer_name}%`]; 
  } else if (mobile_number) {
      query += ' WHERE c.mobile_no ILIKE $1';
      params = [`%${mobile_number}%`];
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
        p.quotation_id = $1 AND p.subcategory = 'ducted split'
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
        p.quotation_id = $1 AND p.subcategory = 'package units'
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

app.get('/api/aircurtain_template', async (req, res) => {
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
        s.model,
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
        p.quotation_id = $1 AND p.subcategory = 'air curtain'
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

app.get('/api/custom_template', async (req, res) => {
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
        p.salesperson_contact
        
      FROM
        customer c
      JOIN
        project p ON c.customer_id = p.customer_id
      
      WHERE
        p.quotation_id = $1 AND p.subcategory = 'custom'
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
        p.quotation_id = $1 AND p.subcategory = 'ducted split'
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
        p.project_area,
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
        p.project_area,
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
        p.quotation_id = $1 AND p.subcategory = 'ducted split'
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
        p.project_area,
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

// Get all supply data
app.get('/api/supply_data', async (req, res) => {
  const { quotationId, customerName, mobileNumber } = req.query;

  console.log('Fetching supply and installation data'); // Debugging line
  try {
      let query = `
          SELECT 
              p.quotation_id, 
              c.customer_name, 
              c.mobile_no AS customer_mobile_number, 
              p.subcategory 
          FROM project p
          JOIN customer c ON p.customer_id = c.customer_id
          WHERE p.category = 'Supply'
      `;
      let queryParams = [];

      if (quotationId) {
          query += ' AND p.quotation_id = $1';
          queryParams.push(quotationId);
      } else if (customerName) {
          query += ' AND c.customer_name ILIKE $1';
          queryParams.push(`%${customerName}%`);
      } else if (mobileNumber) {
          query += ' AND c.mobile_no = $1';
          queryParams.push(mobileNumber);
      }

      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});


// Get supply data by quotation ID
app.get('/api/supply_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM supply WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});


app.get('/api/supply_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM supply WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Your save supply endpoint
app.post('/api/savesupply', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  

  try {
    if (revise) {
      // Existing logic for revising and creating a new quotation ID
      const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;

      // Generate a new quotation ID
      const newQuotationId = generateNewQuotationId(quotation_id);

      // Fetch the original project data
      const projectResult = await pool.query(`
        SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
        FROM project
        WHERE quotation_id = $1
      `, [originalQuotationId]);

      if (projectResult.rows.length === 0) {
        console.error('Original quotation ID not found');
        return res.status(404).send('Original quotation ID not found');
      }

      const projectData = projectResult.rows[0];

      // Insert the new project data with the revised quotation ID
      await pool.query(`
        INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

      // Insert the new supply data with the revised quotation ID
      const supplyInsertPromises = supply_data.map(async (row) => {
        const { type, model, ton, quantity, unit_price, total_price } = row;
        return pool.query(`
          INSERT INTO supply (customer_id, quotation_id, type, model, ton, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [customer_id, newQuotationId, type, model, ton, quantity, unit_price, total_price]);
      });

      await Promise.all(supplyInsertPromises);
      return res.status(200).send('Data saved successfully with revised quotation ID');
    } else {
      console.log('Received payload:', req.body);
      // If not revising, update the existing records or insert new ones
        const upsertPromises = supply_data.map(async (row) => {
        const {  type,model, ton, quantity, unit_price, total_price,supply_id } = row;
        if (supply_id) {
          
          return pool.query(`
              UPDATE supply
              SET type = $4, model = $5, ton = $6, quantity = $7, unit_price = $8, total_price = $9
              WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $3
          `, [supply_id, customer_id, quotation_id, type, model, ton, quantity, unit_price, total_price]);
      }
      
      });

      await Promise.all(upsertPromises);
      return res.status(200).send('Data updated or inserted successfully');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Internal server error');
  }
});




function generateNewQuotationId(quotationId) {
  const parts = quotationId.split('_');
  if (parts.length === 1) {
      return `${quotationId}_RV1`;
  } else {
      const revision = parseInt(parts[1].replace('RV', ''), 10) + 1;
      return `${parts[0]}_RV${revision}`;
  }
}


app.get('/api/supply_inst_data', async (req, res) => {
  const { quotationId, customerName, mobileNumber } = req.query;

  console.log('Fetching supply and installation data'); // Debugging line
  try {
      let query = `
          SELECT 
              p.quotation_id, 
              c.customer_name, 
              c.mobile_no AS customer_mobile_number, 
              p.subcategory 
          FROM project p
          JOIN customer c ON p.customer_id = c.customer_id
          WHERE p.category = 'Supply & Installation'
      `;
      let queryParams = [];

      if (quotationId) {
          query += ' AND p.quotation_id = $1';
          queryParams.push(quotationId);
      } else if (customerName) {
          query += ' AND c.customer_name ILIKE $1';
          queryParams.push(`%${customerName}%`);
      } else if (mobileNumber) {
          query += ' AND c.mobile_no = $1';
          queryParams.push(mobileNumber);
      }

      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Get supply&installation data by quotation ID
app.get('/api/supply_inst_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM supplyandinstallation WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/supply_inst_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM supplyandinstallation WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/savesupplyinst', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
      const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;
      
      let newQuotationId = quotation_id;

      if (revise) {
          // If the user clicked the revise button, generate a new quotation ID
          newQuotationId = generateNewQuotationId(quotation_id);
          
          // Insert the revised data with a new quotation ID
          const projectResult = await pool.query(`
              SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
              FROM project
              WHERE quotation_id = $1
          `, [originalQuotationId]);

          if (projectResult.rows.length === 0) {
              console.error('Original quotation ID not found');
              return res.status(404).send('Original quotation ID not found');
          }

          const projectData = projectResult.rows[0];

          // Insert the new project data with the revised quotation ID
          await pool.query(`
              INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

          // Insert the new supply and installation data with the revised quotation ID
          const supplyInsertPromises = supply_data.map(async (row) => {
              const { type, ton, quantity, unit_price, total_price } = row;
              return pool.query(`
                  INSERT INTO supplyandinstallation (customer_id, quotation_id, type, ton, quantity, unit_price, total_price)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [customer_id, newQuotationId, type, ton, quantity, unit_price, total_price]);
          });

          await Promise.all(supplyInsertPromises);
          res.status(200).send('Data saved successfully with revised quotation ID');
        } else {
          console.log('Received payload:', req.body);
          // If not revising, update the existing records or insert new ones
            const upsertPromises = supply_data.map(async (row) => {
            const {  type, ton, quantity, unit_price, total_price,supply_id } = row;
            if (supply_id) {
              
              return pool.query(`
                  UPDATE supplyandinstallation
                  SET type = $4,  ton = $5, quantity = $6, unit_price = $7, total_price = $8
                  WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $3
              `, [supply_id, customer_id, quotation_id, type, ton, quantity, unit_price, total_price]);
          }
          
          });
    
          await Promise.all(upsertPromises);
          return res.status(200).send('Data updated or inserted successfully');
        }
      } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).send('Internal server error');
      }
    });


app.get('/api/villa_data', async (req, res) => {
  const { quotationId, customerName, mobileNumber } = req.query;

  console.log('Fetching villa data'); // Debugging line
  try {
      let query = `
          SELECT 
              p.quotation_id, 
              c.customer_name, 
              c.mobile_no AS customer_mobile_number, 
              p.subcategory 
          FROM project p
          JOIN customer c ON p.customer_id = c.customer_id
          WHERE p.category = 'villa'
      `;
      let queryParams = [];

      if (quotationId) {
          query += ' AND p.quotation_id = $1';
          queryParams.push(quotationId);
      } else if (customerName) {
          query += ' AND c.customer_name ILIKE $1';
          queryParams.push(`%${customerName}%`);
      } else if (mobileNumber) {
          query += ' AND c.mobile_no = $1';
          queryParams.push(mobileNumber);
      }

      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});


// Get villa data by quotation ID
app.get('/api/villa_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM villa WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/villa_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM villa WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/savevilla', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
      const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;
      
      let newQuotationId = quotation_id;

      if (revise) {
          // If the user clicked the revise button, generate a new quotation ID
          newQuotationId = generateNewQuotationId(quotation_id);
          
          // Insert the revised data with a new quotation ID
          const projectResult = await pool.query(`
              SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
              FROM project
              WHERE quotation_id = $1
          `, [originalQuotationId]);

          if (projectResult.rows.length === 0) {
              console.error('Original quotation ID not found');
              return res.status(404).send('Original quotation ID not found');
          }

          const projectData = projectResult.rows[0];

          // Insert the new project data with the revised quotation ID
          await pool.query(`
              INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

          // Insert the new villa data with the revised quotation ID
          const villaInsertPromises = supply_data.map(async (row) => {
              const { location, area, type, ton, quantity } = row;
              return pool.query(`
                  INSERT INTO villa (customer_id, quotation_id, location, area, type, ton, quantity)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [customer_id, newQuotationId, location, area, type, ton, quantity]);
          });

          await Promise.all(villaInsertPromises);
          res.status(200).send('Data saved successfully with revised quotation ID');
        } else {
          console.log('Received payload:', req.body);
          // If not revising, update the existing records or insert new ones
            const upsertPromises = supply_data.map(async (row) => {
            const {  location, area, type, ton, quantity,supply_id } = row;
            if (supply_id) {
              
              return pool.query(`
                  UPDATE villa
                  SET location = $4,  area = $5, type = $6, ton = $7, quantity = $8
                  WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $3
              `, [supply_id, customer_id, quotation_id, location, area, type, ton, quantity]);
          }
          
          });
    
          await Promise.all(upsertPromises);
          return res.status(200).send('Data updated or inserted successfully');
        }
      } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).send('Internal server error');
      }
    });



app.get('/api/amc_data', async (req, res) => {
  const { quotationId, customerName, mobileNumber } = req.query;

  console.log('Fetching villa data'); // Debugging line
  try {
      let query = `
          SELECT 
              p.quotation_id, 
              c.customer_name, 
              c.mobile_no AS customer_mobile_number, 
              p.subcategory 
          FROM project p
          JOIN customer c ON p.customer_id = c.customer_id
          WHERE p.subcategory = 'AMC'
      `;
      let queryParams = [];

      if (quotationId) {
          query += ' AND p.quotation_id = $1';
          queryParams.push(quotationId);
      } else if (customerName) {
          query += ' AND c.customer_name ILIKE $1';
          queryParams.push(`%${customerName}%`);
      } else if (mobileNumber) {
          query += ' AND c.mobile_no = $1';
          queryParams.push(mobileNumber);
      }

      const result = await pool.query(query, queryParams);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Get amc data by quotation ID
app.get('/api/amc_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM amc WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/amc_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM amc WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/saveamc', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
    const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;

    let newQuotationId = quotation_id;

    if (revise) {
      // If the user clicked the revise button, generate a new quotation ID
      newQuotationId = generateNewQuotationId(quotation_id);
      
      // Insert the revised data with a new quotation ID
      const projectResult = await pool.query(`
        SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
        FROM project
        WHERE quotation_id = $1
      `, [originalQuotationId]);

      if (projectResult.rows.length === 0) {
        console.error('Original quotation ID not found');
        return res.status(404).send('Original quotation ID not found');
      }

      const projectData = projectResult.rows[0];

      // Insert the new project data with the revised quotation ID
      await pool.query(`
        INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

      // Insert the new AMC data with the revised quotation ID
      const amcInsertPromises = supply_data.map(async (row) => {
        const { type,  quantity } = row;
        return pool.query(`
          INSERT INTO amc (customer_id, quotation_id, type, quantity)
          VALUES ($1, $2, $3, $4)
        `, [customer_id, newQuotationId, type, quantity]);
      });

      await Promise.all(amcInsertPromises);
      res.status(200).send('Data saved successfully with revised quotation ID');
    } else {
      // If not revising, update the existing records or insert new ones
      const upsertPromises = supply_data.map(async (row) => {
        const { type, quantity, supply_id } = row;
        if (supply_id) {
          // Update existing record
          return pool.query(`
            UPDATE amc
            SET type = $3, quantity = $4
            WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $5
          `, [supply_id, customer_id, type, quantity, quotation_id]);
        } 
      });

      await Promise.all(upsertPromises);
      res.status(200).send('Data updated or inserted successfully');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Internal server error');
  }
});



app.get('/api/boq_data', async (req, res) => {
  console.log('Fetching all supply data'); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM boq');
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Get boq data by quotation ID
app.get('/api/boq_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM boq WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/boq_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM boq WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/saveboq', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
    const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;

    let newQuotationId = quotation_id;

    if (revise) {
      // If the user clicked the revise button, generate a new quotation ID
      newQuotationId = generateNewQuotationId(quotation_id);
      
      // Insert the revised data with a new quotation ID
      const projectResult = await pool.query(`
        SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
        FROM project
        WHERE quotation_id = $1
      `, [originalQuotationId]);

      if (projectResult.rows.length === 0) {
        console.error('Original quotation ID not found');
        return res.status(404).send('Original quotation ID not found');
      }

      const projectData = projectResult.rows[0];

      // Insert the new project data with the revised quotation ID
      await pool.query(`
        INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

      // Insert the new BOQ data with the revised quotation ID
      const boqInsertPromises = supply_data.map(async (row) => {
        const { supply, installation, total_price } = row;
        return pool.query(`
          INSERT INTO boq (customer_id, quotation_id, supply_amount, installation_amount, total_amount)
          VALUES ($1, $2, $3, $4, $5)
        `, [customer_id, newQuotationId, supply, installation, total_price]);
      });

      await Promise.all(boqInsertPromises);
      res.status(200).send('Data saved successfully with revised quotation ID');
    } else {
      // If not revising, update the existing records or insert new ones
      const upsertPromises = supply_data.map(async (row) => {
        const { supply, installation, total_price, supply_id } = row;  // Assuming 'boq_id' is the equivalent to 'supply_id'
        if (supply_id) {
          // Update existing record
          return pool.query(`
            UPDATE boq
            SET supply_amount = $3, installation_amount = $4, total_amount = $5
            WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $6
          `, [supply_id, customer_id, supply, installation, total_price, quotation_id]);
        }
      });

      await Promise.all(upsertPromises);
      res.status(200).send('Data updated or inserted successfully');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Internal server error');
  }
});



app.get('/api/sp_data', async (req, res) => {
  console.log('Fetching all supply data'); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM spare_parts');
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Get spare parts data by quotation ID
app.get('/api/sp_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM spare_parts WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/sp_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM spare_parts WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/savesp', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
    const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;

    let newQuotationId = quotation_id;

    if (revise) {
      // If the user clicked the revise button, generate a new quotation ID
      newQuotationId = generateNewQuotationId(quotation_id);
      
      // Insert the revised data with a new quotation ID
      const projectResult = await pool.query(`
        SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
        FROM project
        WHERE quotation_id = $1
      `, [originalQuotationId]);

      if (projectResult.rows.length === 0) {
        console.error('Original quotation ID not found');
        return res.status(404).send('Original quotation ID not found');
      }

      const projectData = projectResult.rows[0];

      // Insert the new project data with the revised quotation ID
      await pool.query(`
        INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

      // Insert the new spare parts data with the revised quotation ID
      const supplyInsertPromises = supply_data.map(async (row) => {
        const { type, model, quantity, unit_price, total_price } = row;
        return pool.query(`
          INSERT INTO spare_parts (customer_id, quotation_id, type, model, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [customer_id, newQuotationId, type, model, quantity, unit_price, total_price]);
      });

      await Promise.all(supplyInsertPromises);
      res.status(200).send('Data saved successfully with revised quotation ID');
    } else {
      // If not revising, update the existing records or insert new ones
      const upsertPromises = supply_data.map(async (row) => {
        const { type, model, quantity, unit_price, total_price, supply_id } = row;
        if (supply_id) {
          // Update existing record
          return pool.query(`
            UPDATE spare_parts
            SET type = $3, model = $4, quantity = $5, unit_price = $6, total_price = $7
            WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $8
          `, [supply_id, customer_id, type, model, quantity, unit_price, total_price, quotation_id]);
        } else {
          // Insert new record
          return pool.query(`
            INSERT INTO spare_parts (customer_id, quotation_id, type, model, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [customer_id, quotation_id, type, model, quantity, unit_price, total_price]);
        }
      });

      await Promise.all(upsertPromises);
      res.status(200).send('Data updated or inserted successfully');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Internal server error');
  }
});


app.get('/api/fan_data', async (req, res) => {
  console.log('Fetching all supply data'); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM fans');
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

// Get fan data by quotation ID
app.get('/api/fan_data/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log(`Fetching data for Quotation ID: ${quotationId}`); // Debugging line
  try {
      const result = await pool.query(
          'SELECT * FROM fans WHERE quotation_id = $1',
          [quotationId]
      );
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.get('/api/fan_edit/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  console.log('Fetching supply data for quotationId:', quotationId); // Debugging line
  try {
      const result = await pool.query('SELECT * FROM fans WHERE quotation_id = $1', [quotationId]);
      console.log('Query result:', result.rows); // Debugging line
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query:', err); // Debugging line
      res.status(500).send(err.message);
  }
});

app.post('/api/savefan', async (req, res) => {
  const { quotation_id, customer_id, supply_data, revise } = req.body;

  console.log('Received payload:', req.body);

  try {
    const originalQuotationId = quotation_id.includes('_RV') ? quotation_id.split('_RV')[0] : quotation_id;

    let newQuotationId = quotation_id;

    if (revise) {
      // If the user clicked the revise button, generate a new quotation ID
      newQuotationId = generateNewQuotationId(quotation_id);
      
      // Insert the revised data with a new quotation ID
      const projectResult = await pool.query(`
        SELECT customer_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact
        FROM project
        WHERE quotation_id = $1
      `, [originalQuotationId]);

      if (projectResult.rows.length === 0) {
        console.error('Original quotation ID not found');
        return res.status(404).send('Original quotation ID not found');
      }

      const projectData = projectResult.rows[0];

      // Insert the new project data with the revised quotation ID
      await pool.query(`
        INSERT INTO project (customer_id, quotation_id, project_name, project_type, category, subcategory, salesperson_name, salesperson_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [projectData.customer_id, newQuotationId, projectData.project_name, projectData.project_type, projectData.category, projectData.subcategory, projectData.salesperson_name, projectData.salesperson_contact]);

      // Insert the new fan data with the revised quotation ID
      const supplyInsertPromises = supply_data.map(async (row) => {
        const { type, location, quantity, unit_price, total_price } = row;
        return pool.query(`
          INSERT INTO fans (customer_id, quotation_id, type, location, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [customer_id, newQuotationId, type, location, quantity, unit_price, total_price]);
      });

      await Promise.all(supplyInsertPromises);
      res.status(200).send('Data saved successfully with revised quotation ID');
    } else {
      // If not revising, update the existing records or insert new ones
      const upsertPromises = supply_data.map(async (row) => {
        const { type, location, quantity, unit_price, total_price, supply_id } = row;
        if (supply_id) {
          // Update existing record
          return pool.query(`
            UPDATE fans
            SET type = $3, location = $4, quantity = $5, unit_price = $6, total_price = $7
            WHERE supply_id = $1 AND customer_id = $2 AND quotation_id = $8
          `, [supply_id, customer_id, type, location, quantity, unit_price, total_price, quotation_id]);
        } else {
          // Insert new record
          return pool.query(`
            INSERT INTO fans (customer_id, quotation_id, type, location, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [customer_id, quotation_id, type, location, quantity, unit_price, total_price]);
        }
      });

      await Promise.all(upsertPromises);
      res.status(200).send('Data updated or inserted successfully');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Internal server error');
  }
});


app.get('/api/vrf_villa_template', async (req, res) => {
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
        p.quotation_id = $1 AND p.subcategory = 'vrf'
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

// Get customers for dropdown
app.get('/customers_agr', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT customer_id, customer_name FROM customer');
      res.json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching customers.' });
  }
});

app.get('/quotations_agr', async (req, res) => {
  const { customer_id } = req.query;
  try {
      const result = await pool.query('SELECT quotation_id FROM project WHERE customer_id = $1', [customer_id]);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.post('/add-project_agr', async (req, res) => {
  const { customer_id, quotation_id, agreement_id, id_number, project_location, project_type, category, subcategory } = req.body;
  try {
      await pool.query(`
          INSERT INTO agreement_project (customer_id, quotation_id, id_number, project_location, project_type, category, subcategory)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [customer_id, quotation_id, id_number, project_location, project_type, category, subcategory]);
      res.status(201).send('Project Added');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.put('/edit-project_agr/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_id, quotation_id,  id_number, project_location, project_type, category, subcategory } = req.body;
  try {
      await pool.query(`
          UPDATE agreement_project
          SET customer_id = $1, quotation_id = $2,  id_number = $3, project_location = $4, project_type = $5, category = $6, subcategory = $7
          WHERE sl_no = $8
      `, [customer_id, quotation_id, id_number, project_location, project_type, category, subcategory, id]);
      res.status(200).send('Project Updated');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.get('/projects_agr/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query(`
          SELECT ap.sl_no, c.customer_name,c.mobile_no, p.quotation_id, ap.agreement_id, ap.id_number, ap.project_location, ap.project_type, ap.category, ap.subcategory
          FROM agreement_project ap
          JOIN customer c ON ap.customer_id = c.customer_id
          JOIN project p ON ap.quotation_id = p.quotation_id
          WHERE ap.sl_no = $1
      `, [id]);
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Delete a project
app.delete('/delete-project_agr/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await pool.query('DELETE FROM agreement_project WHERE sl_no = $1', [id]);
      res.status(200).send('Project Deleted');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.get('/agreement', async (req, res) => {
  const agreementId = req.query.agreement_id;
  let query = `
      SELECT 
          ap.sl_no as project_id, 
          ap.agreement_id, 
          ap.id_number, 
          ap.project_location, 
          ap.project_type, 
          ap.category, 
          ap.subcategory, 
          c.customer_name, 
          c.mobile_no,
          p.quotation_id
      FROM agreement_project ap
      JOIN project p ON ap.quotation_id = p.quotation_id
      JOIN customer c ON ap.customer_id = c.customer_id
  `;
  let params = [];

  if (agreementId) {
      query += ' WHERE ap.agreement_id = $1';
      params = [agreementId];
  }

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching projects.' });
  }
});

app.get('/api/agreement_villa', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.customer_name, ap.agreement_id, ap.subcategory
      FROM customer c
      JOIN agreement_project ap ON c.customer_id = ap.customer_id
      WHERE ap.category = 'villa'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/duct_villa_agreement', async (req, res) => {
  const { agreementId } = req.query;

  if (!agreementId) {
    return res.status(400).json({ error: 'Agreement ID is required' });
  }

  try {
    const result = await pool.query(`
      SELECT
        p.project_location,
        p.agreement_id,
        p.id_number,
        c.customer_name,
        c.mobile_no,
        s.area,
        s.type,
        s.ton,
        s.quantity,
        s.location
      FROM
        customer c
      JOIN
        agreement_project p ON c.customer_id = p.customer_id
      JOIN
        villa s ON p.quotation_id = s.quotation_id
      WHERE
        p.agreement_id = $1 AND p.subcategory = 'duct'
    `, [agreementId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given quotation ID' });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching data for duct template:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/add-employee', async (req, res) => {
  const { employee_name, qatar_id, expiry_date, profession, renewal_date, contact } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO employee (employee_name, qatar_id, expiry_date, profession, renewal_date, contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [employee_name, qatar_id, expiry_date, profession, renewal_date, contact]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Handle editing customer details
app.put('/edit-employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const { employee_name, qatar_id, expiry_date, profession, renewal_date, contact } = req.body;
  try {
    const result = await pool.query(
      'UPDATE employee SET employee_name = $1, qatar_id = $2, expiry_date = $3, profession = $4, renewal_date = $5, contact = $6 WHERE employee_id = $7 RETURNING *',
      [employee_name, qatar_id, expiry_date, profession, renewal_date, contact, employeeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Employee not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
;

// Handle deleting customer
app.delete('/delete-employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    await pool.query('DELETE FROM employee WHERE employee_id = $1', [employeeId]);
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Fetch all customers or search customers by name
app.get('/employees', async (req, res) => {
  const searchQuery = req.query.search ? `%${req.query.search}%` : '%';
  try {
    const result = await pool.query(
      'SELECT * FROM employee WHERE employee_name ILIKE $1',
      [searchQuery]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/employees/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM employee WHERE employee_id = $1', [employeeId]);
    const project = result.rows[0];
    if (!project) {
      // If project with the provided ID doesn't exist, send a 404 response
      return res.status(404).send('employee not found');
    }
    // If project exists, send it as JSON
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/employees-expiring-soon', async (req, res) => {
  try {
      const result = await pool.query(
          `SELECT employee_name, qatar_id, TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date 
           FROM employee 
           WHERE expiry_date <= NOW() + INTERVAL '2 weeks'`
      );
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.get('/employees-expiring-soon-count', async (req, res) => {
  try {
      const result = await pool.query(
          `SELECT COUNT(*) AS count 
           FROM employee 
           WHERE expiry_date <= NOW() + INTERVAL '2 weeks'`
      );
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

import { google } from 'googleapis';
const oauth2Client = new google.auth.OAuth2(
  '31715117103-9hpeqn94p8rvno7d8q60cht4sbspodtj.apps.googleusercontent.com', // Your Client ID
  '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', // Your Client Secret
  'http://localhost:3000/auth/google/callback' // Your Redirect URI
);

oauth2Client.setCredentials({
  access_token: ' ya29.a0AcM612zWTAgdqwcz-6tx8W3_phTnCdeOFPaiMqW9iEgt2b4_uuDRWlK7MBvhcxFt0aLML494MvSESGGeeTUUaO2N531pG5tEdQREio7tyWiV5n1fcgEYwbOsHOvoqcgw5ToCj7mQXnHZG7l6jTLn2RBlpLPt3v-c7jzQBOQ9aCgYKAUISARMSFQHGX2Mi9j5oK9-BWPEb0P6x3kVPBA0175',
  refresh_token: '1//03BjPGFIicqfMCgYIARAAGAMSNwF-L9IrSHb_JwweO0tRCKw6lbPAFQNHSbthUbq5t21cj9kFe8V7nZn-v8O6P3-aCapnCkWsSe8'
});
// Step 1: Frontend redirects to Google OAuth URL
app.get('/auth/google', (req, res) => {
  

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Necessary to receive a refresh token
    scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/documents'],
  });

  // Redirect the user to the Google Authorization URL
  res.redirect(authorizationUrl);
});
global.tokens = null; // Initialize as null
// Step 2: Backend exchanges the authorization code for tokens
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query; // Get the authorization code from the query parameters

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Log the tokens
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    // Store tokens in a variable or database
    // For simplicity, we'll store it in memory here
    global.tokens = tokens;

    // Set the credentials
    oauth2Client.setCredentials(tokens);

    // Send a success response
    res.send('Authentication successful!');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});




const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function createGoogleDoc(req, res) {
  const fileMetadata = {
    'name': 'My New Quotation',
    'mimeType': 'application/vnd.google-apps.document',
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    console.log('File ID:', response.data.id);
    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).send('Error creating document');
  }
}



async function refreshAccessToken() {
  try {
    const { credentials } = await oauth2Client.refreshToken(oauth2Client.credentials.refresh_token);
    oauth2Client.setCredentials(credentials);
    
    // Update stored tokens
    global.tokens = credentials; // Update global tokens
    console.log('New Access Token:', credentials.access_token);
    
    // Optionally, save the new tokens to your database or environment variables
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}



function isTokenExpired() {
  const currentTime = new Date().getTime();
  const expiryTime = oauth2Client.credentials.expiry_date;
  return expiryTime <= currentTime;
}



app.post('/create-doc', createGoogleDoc);


const docs = google.docs({ version: 'v1', auth: oauth2Client });

// Function to fetch Google Doc content
async function getDocumentContent(docId) {
  try {
    const response = await docs.documents.get({
      documentId: docId,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching document content:', error);
    throw error;
  }
}
async function ensureValidToken() {
  try {
    const currentTime = new Date().getTime();
    const expiryTime = oauth2Client.credentials.expiry_date;

    if (!oauth2Client.credentials.access_token || expiryTime <= currentTime) {
      // If the token is expired, refresh it
      if (!oauth2Client.credentials.refresh_token) {
        throw new Error('No refresh token available');
      }

      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      console.log('New Access Token:', credentials.access_token);
    }
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error; // Propagate the error
  }
}

// Example of using the function to get content
app.get('/fetch-doc-content', async (req, res) => {
  const docId = '1zhvwocfwzDLtuSG77JwWZeLTOKNelM1elfdbk6gFqSA'; // The ID of the document you want to fetch
  try {
    await ensureValidToken(); 
    const docContent = await getDocumentContent(docId);
    res.json(docContent); // Send the document content as a response
  } catch (error) {
    res.status(500).send('Error fetching document content');
  }
});

app.get('/fetch-doc-supplyandinst', async (req, res) => {
  const docId = '1oV0JbxYfxUWkvYvrGVaUDF1R5Hu5pXsUcLryQEGKjwQ'; // Document ID
  try {
    await ensureValidToken(); // Ensure Google Docs API access token is valid
    const docContent = await getDocumentContent(docId); // Fetch the document content

    // Initialize variables to hold the sections of content
    let contentBeforeTable = [];
    let contentAfterTable = [];
    let isBeforeTable = true; // Flag to indicate which section we're in

    // Iterate over the document content
    docContent.body.content.forEach(element => {
      if (element.paragraph && element.paragraph.elements) {
        const paragraphText = element.paragraph.elements.map(e => e.textRun?.content || '').join('').trim();

        // Check for marker headings
        if (paragraphText === 'Start Before Table') {
          isBeforeTable = true; // We are in the 'before table' section
        } else if (paragraphText === 'Start After Table') {
          isBeforeTable = false; // We are in the 'after table' section
        } else {
          // Push content into the appropriate section
          if (isBeforeTable) {
            contentBeforeTable.push(element); // Add this paragraph to 'before' section
          } else {
            contentAfterTable.push(element); // Add this paragraph to 'after' section
          }
        }
      }
    });

    // Return the content to the front-end in JSON format (preserving original formatting)
    res.json({
      beforeTable: contentBeforeTable,
      afterTable: contentAfterTable
    });
  } catch (error) {
    console.error('Error fetching document content:', error);
    res.status(500).send('Error fetching document content');
  }
});

app.post('/add-product', async (req, res) => {
  const { product_name, model, capacity } = req.body;
  try {
      await pool.query(`
          INSERT INTO product (product_name, model, capacity)
          VALUES ($1, $2, $3)
      `, [product_name, model, capacity]);
      res.status(201).send('Project Added');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.put('/edit-product/:id', async (req, res) => {
  const { id } = req.params;  // Should fetch the id correctly
  const { product_name, model, capacity } = req.body;

  console.log("Received Product ID:", id);  // Debugging the received product ID

  try {
      await pool.query(`
          UPDATE product
          SET product_name = $1, model = $2, capacity = $3
          WHERE product_id = $4
      `, [product_name, model, capacity, id]);  // Ensure id is used in the query
      res.status(200).send('Product Updated');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});


app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query(`
          SELECT 
          product_id,
          product_name, 
          model,
          capacity 
          FROM product
          
          WHERE product_id = $1
      `, [id]);
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Delete a project
app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting product with ID: ${id}`);
  try {
      await pool.query('DELETE FROM product WHERE product_id = $1', [id]);
      res.status(200).send('Project Deleted');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.get('/products', async (req, res) => {
  const agreementId = req.query.agreement_id;
  let query = `
      SELECT 
        
          product_id,
          product_name, 
          model,
          capacity 
          
      FROM product 
      
  `;
  let params = [];

  if (agreementId) {
      query += ' WHERE ap.agreement_id = $1';
      params = [agreementId];
  }

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching projects.' });
  }
});


app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT product_name, model, capacity FROM product');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/add-sales', async (req, res) => {
  const { person_name, contact } = req.body;
  try {
      await pool.query(`
          INSERT INTO sales (person_name, contact)
          VALUES ($1, $2)
      `, [person_name, contact]);
      res.status(201).send('Project Added');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.put('/edit-sales/:id', async (req, res) => {
  const { id } = req.params;  // Should fetch the id correctly
  const { person_name, contact } = req.body;

  console.log("Received Product ID:", id);  // Debugging the received product ID

  try {
      await pool.query(`
          UPDATE sales
          SET person_name = $1, contact = $2
          WHERE sales_id = $3
      `, [person_name, contact, id]);  // Ensure id is used in the query
      res.status(200).send('Product Updated');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});


app.get('/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query(`
          SELECT 
          sales_id,
          person_name, 
          contact
           
          FROM sales
          
          WHERE sales_id = $1
      `, [id]);
      res.json(result.rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Delete a project
app.delete('/delete-sales/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting product with ID: ${id}`);
  try {
      await pool.query('DELETE FROM sales WHERE sales_id = $1', [id]);
      res.status(200).send('Project Deleted');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.get('/sales', async (req, res) => {
  const agreementId = req.query.agreement_id;
  let query = `
      SELECT 
        
          sales_id,
          person_name, 
          contact
         
          
      FROM sales 
      
  `;
  let params = [];

  if (agreementId) {
      query += ' WHERE ap.agreement_id = $1';
      params = [agreementId];
  }

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching projects.' });
  }
});


app.get('/api/sales', async (req, res) => {
  try {
      const result = await pool.query('SELECT person_name, contact FROM sales');
      res.json(result.rows); // Send the data back as JSON
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

app.get('/config.json', (req, res) => {
  // Serve the config.json file
  fs.readFile('./config.json', 'utf8', (err, data) => {
      if (err) {
          res.status(500).send('Error reading config file');
      } else {
          res.send(data);
      }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
