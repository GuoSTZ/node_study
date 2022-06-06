import express from 'express';

const app = express();
const PORT = 5400;
app.use(express.json());

app.get('/', (req: any, res: any) => {
  res.send('Hello World!');
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});