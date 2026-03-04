const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Simple API route to test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cricket Analytics API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
