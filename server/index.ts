import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import { logging } from './middleware/logging';
import { loginRouter } from './routes/login';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'this is a test',
  resave: true,
  saveUninitialized: true
}));
app.use(logging);
app.use('/', loginRouter);

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});