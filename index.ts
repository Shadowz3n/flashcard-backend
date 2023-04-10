import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import {
  createCard,
  deleteCard,
  getAllCards,
  updateCard,
} from "./controllers/card.controller";
import {
  getAllDecks,
  createDeck,
  deleteDeck,
  updateDeck,
} from "./controllers/deck.controller";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "./controllers/user.controller";
dotenv.config({ path: ".env" });

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@flashcard-backend.gd2ssll.mongodb.net/test`
  )
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB Atlas:", error);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

app.post("/users", createUser);
app.get("/users", getAllUsers);
app.get("/users/:id", getUserById);
app.put("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);

app.get("/cards", getAllCards);
app.post("/cards", createCard);
app.put("/cards/:id", updateCard);
app.delete("/cards/:id", deleteCard);

app.get("/decks", getAllDecks);
app.post("/decks", createDeck);
app.put("/decks/:id", updateDeck);
app.delete("/decks/:id", deleteDeck);
