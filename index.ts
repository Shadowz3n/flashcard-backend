import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
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
import jwt from "jsonwebtoken";
import { IUser, User } from "./models/user.model";
import bcrypt from "bcrypt";

const secret = "mysecretkey";
dotenv.config({ path: ".env" });

interface UserPayload {
  _id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

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


app.post("/login", async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.sendStatus(401);
  }
  const isValidPassword = req.body.password === user.password;

  if (!isValidPassword) {
    return res.sendStatus(401);
  }
  const token = generateToken(user);

  res.json({ token });
});

function generateToken(user: IUser) {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "1h",
  };

  return jwt.sign(payload, secret, options);
}

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user as UserPayload;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.post("/users", createUser);
app.get("/users", verifyToken, getAllUsers);
app.get("/users/:id", verifyToken, getUserById);
app.put("/users/:id", verifyToken, updateUser);
app.delete("/users/:id", verifyToken, deleteUser);

app.get("/cards", verifyToken, getAllCards);
app.post("/cards", verifyToken, createCard);
app.put("/cards/:id", verifyToken, updateCard);
app.delete("/cards/:id", verifyToken, deleteCard);

app.get("/decks", verifyToken, getAllDecks);
app.post("/decks", verifyToken, createDeck);
app.put("/decks/:id", verifyToken, updateDeck);
app.delete("/decks/:id", verifyToken, deleteDeck);
