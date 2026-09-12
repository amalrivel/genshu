import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { auth, requireAdmin, requireAuth } from './auth.ts';
import { content, contentError, participantPractice } from './content.ts';

const app: Express = express();

var corsOptions = {
  origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
app.get('/health', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(express.json({ limit: '1mb' }));
app.use(auth);
app.use(requireAuth, participantPractice);
app.use(requireAuth, requireAdmin, content);
app.use((_req, res) => { res.status(404).json({ error: 'Route not found.' }); });
app.use(contentError);

app.listen(3000);
