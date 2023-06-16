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
  getUserSelfInfo,
  order66,
  updateUser,
} from "./controllers/user.controller";
import jwt, { JwtPayload, decode } from "jsonwebtoken";
import { IUser, User } from "./models/user.model";
import {
  getAllDecksWithHistory,
  getCardsByDeckIdWithHistory,
  updateCardHistory,
} from "./controllers/cardHistory.controller";
import { updateDeckHistory } from "./controllers/deckHistory.controller";
import {
  getAllUserDecksWithHistory,
  getRecentlyPlayedDecks,
} from "./controllers/userRoutes.controller";

const secret = "mysecretkey";
dotenv.config({ path: ".env" });

interface UserPayload {
  id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      userId: string;
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
    // expiresIn: "5h",
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
      if (typeof user !== "string") {
        req.user = user as UserPayload;
      }
      next();
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
app.get("/api/users/me", verifyToken, getUserSelfInfo);
app.put("/api/users/:id", verifyToken, updateUser);
app.delete("/api/users/:id", verifyToken, deleteUser);

// card routes
app.get("/api/cards", verifyToken, getAllCards);
app.get("/api/decks/:deckId/cards", verifyToken, getAllCardsByDeckId);
app.post("/api/cards", verifyToken, createCard);
app.put("/api/cards/:id", verifyToken, updateCard);
app.delete("/api/cards/:id", verifyToken, deleteCard);

// cardHistory routes
app.put("/api/cardHistory/:id", verifyToken, updateCardHistory);
app.get("/api/cardHistory/:deckId", verifyToken, getCardsByDeckIdWithHistory);
app.get("/api/cardHistory/decks/all", verifyToken, getAllDecksWithHistory);
// app.get("/api/cardHistory/decks/recent", verifyToken, getRecentlyPlayedDecks);

// deckHistory routes
app.put("/api/deckHistory/:deckId", verifyToken, updateDeckHistory);

// userRoutes routes
app.get("/api/userRoutes/decks/all", verifyToken, getAllUserDecksWithHistory);
app.get("/api/userRoutes/recent", verifyToken, getRecentlyPlayedDecks);

// deck routes
app.get("/api/decks", verifyToken, getAllDecks);
app.post("/api/decks", verifyToken, createDeck);
app.put("/api/decks/:id", verifyToken, updateDeck);
app.delete("/api/decks/:id", verifyToken, deleteDeck);

// erase all data
app.delete("/api/order66", verifyToken, order66);