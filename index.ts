import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

// import { getStatistics } from './statistics';

const app = express();
const port = 8088;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to database
mongoose.connect('mongodb+srv://fuchsgerson:6tYHHrqA8Kw2bXcM@flashcard-backend.gd2ssll.mongodb.net/test').then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(3000, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Define schema
const cardSchema = new mongoose.Schema({
  question: String,
  answer: String,
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
});

// Define model
const Card = mongoose.model('Card', cardSchema);

// app.get('/statistics', getStatistics);


// API endpoints
app.get('/cards', async (req: Request, res: Response) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching cards');
  }
});

app.post('/cards', async (req: Request, res: Response) => {
  try {
    const card = new Card(req.body);
    await card.save();
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating card');
  }
});

app.put('/cards/:id', async (req: Request, res: Response) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).send('Card not found');
    }
    if (req.body.correct) {
      card.correctCount++;
    } else {
      card.incorrectCount++;
    }
    await card.save();
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating card');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
