import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
