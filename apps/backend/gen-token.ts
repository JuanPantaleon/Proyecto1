import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const token = jwt.sign({ sub: '70767518-f58c-4efe-92a1-29660704f9f0' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
console.log('Token:', token);