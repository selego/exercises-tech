import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  mongoUri: process.env.MONGO_URI || "mongodb+srv://office:office@tech-exercises.tkqktjq.mongodb.net/?retryWrites=true&w=majority&appName=tech-exercises",
};

export default config;
