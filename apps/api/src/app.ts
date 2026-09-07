import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors'

const app: Express = express();

var corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
app.get('/health', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(3000);