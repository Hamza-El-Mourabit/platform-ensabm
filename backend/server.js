const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/professors', require('./routes/professorRoutes'));
app.use('/api/admin/modules', require('./routes/moduleRoutes'));
app.use('/api/emplois-du-temps', require('./routes/emploiDuTempsRoutes'));
app.use('/api/emplois-personnalises', require('./routes/emploiPersonnaliseRoutes'));
app.use('/api/planning-exams', require('./routes/planningExamsRoutes'));
app.use('/api/projets', require('./routes/projetRoutes'));
app.use('/api/evenements', require('./routes/evenementRoutes'));
app.use('/api/formations', require('./routes/formationRoutes'));
app.use('/api/statistics', require('./routes/statisticsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});