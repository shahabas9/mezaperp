import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const app = express();
const port = 3000;

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
  const { customer_id, project_name, project_type, category, subcategory } = req.body;
  try {
    const projectResult = await pool.query(
      'INSERT INTO project (customer_id, project_name, project_type, category, subcategory) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, project_name, project_type, category, subcategory]
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
  const { customer_id, project_name, project_type, category, subcategory } = req.body;
  try {
    const result = await pool.query(
      'UPDATE project SET customer_id = $1, project_name = $2, project_type = $3, category = $4, subcategory = $5 WHERE project_id = $6 RETURNING *',
      [customer_id, project_name, project_type, category, subcategory, id]
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
