import dotenvFlow from 'dotenv-flow';
import app from './app.js';
import { connectMongo } from './config/mongo.js';

dotenvFlow.config();

const PORT = process.env.PORT ;

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

