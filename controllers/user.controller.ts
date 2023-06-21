import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";
import { CardHistory } from "../models/cardHistory.model";
// import { calculateDailyStreak } from "../utils/dailyStreak";
import { isSameDay, isToday, subDays } from "date-fns";

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
    });
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error: any) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.email === 1
    ) {
      res.status(400).json({ error: "Email already exists" });
    }
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
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const dailyStreak = await calculateDailyStreak(user._id);
    const userData = { ...user.toObject(), dailyStreak };
    res.status(200).json(userData);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};


export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
        password,
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

function isPreviousDay(date1: Date, date2: Date): boolean {
  const previousDate = subDays(date1, 1);
  return isSameDay(previousDate, date2);
}

async function calculateDailyStreak(userId: string): Promise<number> {
  const cardHistories = await CardHistory.find({ userId })
    .sort({ date: "desc" })
    .exec();

  let currentStreak = 0;
  let longestStreak = 0;
  let consecutiveDays = 0;
  let previousDate: Date | null = null;

  cardHistories.forEach((history) => {
    const currentDate = new Date(history.date);
    if (previousDate) {
      const isConsecutiveDay = isPreviousDay(previousDate, currentDate);
      if (isConsecutiveDay) {
        consecutiveDays++;
      } else {
        consecutiveDays = 1;
      }
    } else {
      consecutiveDays = 1;
    }
    previousDate = currentDate;

    if (consecutiveDays > longestStreak) {
      longestStreak = consecutiveDays;
    }
    if (isToday(currentDate)) {
      currentStreak = consecutiveDays;
    }
  });

  return currentStreak;
}
