import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { env } from './env.js';

const connectionConfig = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  server: env.DB_SERVER,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const adapter = new PrismaMssql(connectionConfig);
const prisma = new PrismaClient({ adapter });

export default prisma;