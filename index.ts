import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  createCard,
  deleteCard,
  getAllCards,
  getAllCardsByDeckId,
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

function generateToken(user: IUser) {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "5h",
  };

  return jwt.sign(payload, secret, options);
}

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secret, (err, user) => {
      req.user = user as UserPayload;
      next();
      // if (err) {
      //   console.log("someone is trying to access", authHeader, token, secret);
      //   return res.sendStatus(403);
      // }
    });
  } else {
    res.sendStatus(401);
  }
}

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
app.post("/logout", (req: Request, res: Response) => {
  const expiredToken = jwt.sign({ id: "", username: "" }, secret, {
    expiresIn: 0,
  });
  res.cookie("token", expiredToken, { httpOnly: true, expires: new Date(0) });
  res.sendStatus(200);
});

// user routes
app.post("/users", createUser);
app.get("/api/users", verifyToken, getAllUsers);
app.get("/api/users/:id", verifyToken, getUserById);
app.put("/api/users/:id", verifyToken, updateUser);
app.delete("/api/users/:id", verifyToken, deleteUser);

// card routes
app.get("/api/cards", verifyToken, getAllCards);
app.get("/api/decks/:deckId/cards", verifyToken, getAllCardsByDeckId);
app.post("/api/cards", verifyToken, createCard);
app.put("/api/cards/:id", verifyToken, updateCard);
app.delete("/api/cards/:id", verifyToken, deleteCard);

// deck routes
app.get("/api/decks", verifyToken, getAllDecks);
app.post("/api/decks", verifyToken, createDeck);
app.put("/api/decks/:id", verifyToken, updateDeck);
app.delete("/api/decks/:id", verifyToken, deleteDeck);
