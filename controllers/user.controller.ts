import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const user = new User({
      username,
      email,
      password,
      cards: [],
    });
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getUserSelfInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password, cards } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
        password,
        cards,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const updateCardDifficulty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cardId = req.params.id;
    const { userDifficulty } = req.body;
    const userId = req.user?.id;

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const cardIndex = user.cards.findIndex(
      (card) => card.cardId.toString() === cardId
    );

    if (cardIndex === -1) {
      user.cards.push({
        cardId: cardId,
        history: [
          {
            date: new Date(),
            userDifficulty: userDifficulty,
          },
        ],
      });
    } else {
      user.cards[cardIndex].history.push({
        date: new Date(),
        userDifficulty: userDifficulty,
      });
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const order66 = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.deleteMany({});
    await Deck.deleteMany({});
    await Card.deleteMany({});
    res.json({ message: "It is done my Lord." });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
