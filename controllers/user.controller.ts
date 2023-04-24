import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";

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

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
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
    const { userDifficulty, userId, cardId } = req.body;

    const user: IUser | null = await User.findById(userId);
    console.log("user", user);
    if (!user) {
      throw new Error("User not found.");
    }

    const cardIndex = user.cards.findIndex(
      (card) => card.cardId.toString() === cardId
    );
    console.log("cardIndex", cardIndex);

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




