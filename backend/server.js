const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/authRoutes');
const scoreRoutes = require('./src/routes/scoreRoutes');

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in production');
    }
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/typing-app');
    console.log('MongoDB Connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
