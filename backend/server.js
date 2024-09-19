const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Define the path to the visits file
const visitsFilePath = path.join(__dirname, 'visits.json');
const dataFilePath = path.join(__dirname, 'data.json');

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse incoming JSON requests

// Handle the root path request
app.get('/', (req, res) => {
  res.send('Welcome to the API server!');
});

// Fetch all visits
app.get('/api/visits', (req, res) => {
  console.log('Received GET request for /api/visits');
  fs.readFile(visitsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading visits file' });
    }
    try {
      const visits = JSON.parse(data);
      res.json(visits);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing visits data' });
    }
  });
});

// Record a new visit
app.post('/api/visits', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  fs.readFile(visitsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading visits file' });
    }
    try {
      const visits = JSON.parse(data);
      visits.push({ url, timestamp: new Date().toISOString() });

      fs.writeFile(visitsFilePath, JSON.stringify(visits, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing visits file' });
        }
        res.json({ url });
      });
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing visits data' });
    }
  });
});

// Fetch all data items
app.get('/api/data', (req, res) => {
  console.log('Received GET request for /api/data');
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading data file' });
    }
    try {
      const dataItems = JSON.parse(data);
      res.json(dataItems);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing data' });
    }
  });
});

// Add a new data item
app.post('/api/data', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading data file' });
    }
    try {
      const dataItems = JSON.parse(data);
      const newItem = { id: Date.now(), name }; // Use timestamp as a unique ID
      dataItems.push(newItem);

      fs.writeFile(dataFilePath, JSON.stringify(dataItems, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing data file' });
        }
        res.json(newItem);
      });
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing data' });
    }
  });
});

// Update a data item
app.put('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading data file' });
    }
    try {
      let dataItems = JSON.parse(data);
      dataItems = dataItems.map(item => item.id === parseInt(id) ? { ...item, name } : item);

      fs.writeFile(dataFilePath, JSON.stringify(dataItems, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing data file' });
        }
        res.json(dataItems.find(item => item.id === parseInt(id)));
      });
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing data' });
    }
  });
});

// Delete a data item
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading data file' });
    }
    try {
      let dataItems = JSON.parse(data);
      dataItems = dataItems.filter(item => item.id !== parseInt(id));

      fs.writeFile(dataFilePath, JSON.stringify(dataItems, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error writing data file' });
        }
        res.json({ message: 'Item deleted' });
      });
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing data' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
