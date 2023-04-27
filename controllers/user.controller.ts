import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";
import { groupBy } from "../utils/countCardsByDay";

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

export const getCardsStudiedByDay = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const cardsHistory = user.cards.flatMap((card) => card.history);
    const cardsByDate = groupBy(cardsHistory, (history) =>
      history.date.toDateString()
    );
    const cardsStudiedByDay = Object.keys(cardsByDate).map((date) => {
      return {
        date: date,
        count: cardsByDate[date].length,
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let currentStreak = 0;
    while (cardsByDate[today.toDateString()]) {
      currentStreak++;
      today.setDate(today.getDate() - 1);
    }
    const currentStreakStart = new Date(
      today.setDate(today.getDate() + 1)
    ).toDateString();

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreakLength = 0;
    let longestStreakStart = "";
    let longestStreakEnd = "";
    Object.keys(cardsByDate).forEach((date, index) => {
      if (index === 0) {
        currentStreakLength = 1;
        longestStreakStart = date;
      } else {
        const currentDate = new Date(date);
        const previousDate = new Date(Object.keys(cardsByDate)[index - 1]);
        const timeDifference = today.getTime() - previousDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        if (daysDifference === 1) {
          currentStreakLength++;
        } else {
          if (currentStreakLength > longestStreak) {
            longestStreak = currentStreakLength;
            longestStreakStart = new Date(
              currentDate.getTime() -
                (currentStreakLength - 1) * 24 * 60 * 60 * 1000
            ).toDateString();
            longestStreakEnd = new Date(previousDate).toDateString();
          }
          currentStreakLength = 1;
        }
      }
    });
    if (currentStreakLength > longestStreak) {
      longestStreak = currentStreakLength;
      longestStreakStart = new Date(
        new Date().setDate(new Date().getDate() - currentStreakLength + 1)
      ).toDateString();
      longestStreakEnd =
        Object.keys(cardsByDate)[Object.keys(cardsByDate).length - 1];
    }

    res.json({
      cardsStudiedByDay,
      currentStreak,
      currentStreakStart,
      longestStreak,
      longestStreakStart,
      longestStreakEnd,
    });

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

