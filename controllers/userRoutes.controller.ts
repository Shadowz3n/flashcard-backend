import { Request, Response } from "express";
import { Deck } from "../models/deck.model";
import { CardHistory } from "../models/cardHistory.model";
import { Card } from "../models/card.model";
import { DeckHistory } from "../models/deckHistory.model";
import { addCardHistory } from "../utils/addCardHistory";
import { IUser, User } from "../models/user.model";

export const getAllUserDecksWithHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const decks = await Deck.find().lean().exec();

    const createdDecks = decks.filter((deck) => deck.createdBy === userId);
    const externalDecks = await DeckHistory.find({ userId });

    const externalDeckIds = externalDecks.map((deck) => deck.deckId);
    const externalDecksData = await Deck.find({
      _id: { $in: externalDeckIds },
    });

    const joinedDecks = [...createdDecks, ...externalDecksData];

    const decksWithUserCardHistory = await addCardHistory(joinedDecks, userId);

    const updatedDecks = await Promise.all(
      decksWithUserCardHistory.map(async (deck) => {
        if (deck.createdBy !== userId) {
          const createdUser: IUser | null = await User.findById(
            deck.createdBy
          ).exec();
          const createdByName = createdUser ? createdUser.username : "";
          return {
            ...deck,
            createdByName,
          };
        }
        return deck;
      })
    );

    res.status(200).json(updatedDecks);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};


export const getRecentlyPlayedDecks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const cardHistories = await CardHistory.find({ userId })
      .sort({ date: "desc" })
      .exec();
    const cardIds = [...new Set(cardHistories.map((ch) => ch.cardId))];
    const decks = await Deck.find({ cards: { $in: cardIds } }).exec();

    const cardsWithHistory = await addCardHistory(decks, userId);

    res.status(200).json(cardsWithHistory);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getUnrelatedDecks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const decks = await Deck.find({ createdBy: { $ne: userId } }).exec();
    const deckIds = decks.map((deck) => deck._id.toString());

    const deckHistory = await DeckHistory.find({
      userId,
      deckId: { $in: deckIds },
    }).exec();

    const filteredDecks = decks.filter((deck) => {
      const deckHistoryEntry = deckHistory.find(
        (entry) => entry.deckId === deck._id.toString()
      );
      return !deckHistoryEntry || !deckHistoryEntry.addedAt;
    });

    const updatedDecks = await Promise.all(
      filteredDecks.map(async (deck) => {
        const createdUser: IUser | null = await User.findById(
          deck.createdBy
        ).exec();
        const createdByName = createdUser ? createdUser.username : "";
        return {
          ...deck.toObject(),
          createdByName,
        };
      })
    );

    res.status(200).json(updatedDecks);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const listActivities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const userDecks = await Deck.find({ createdBy: userId }).exec();
    const deckIds = userDecks.map((deck) => deck._id.toString());

    const deckActivities = await DeckHistory.find({ deckId: { $in: deckIds } })
      .populate("userId", "username")
      .exec();

    const activities = await Promise.all(
      deckActivities.map(async (activity) => {
        const addedBy: IUser | null = await User.findById(
          activity.userId
        ).exec();
        return {
          deckId: activity.deckId,
          addedBy: addedBy ? { id: addedBy._id, name: addedBy.username } : null,
          addedAt: activity.addedAt,
          removedAt: activity.removedAt,
        };
      })
    );

    const decksWithActivities = userDecks
      .map((deck) => ({
        ...deck.toObject(),
        activities: activities.filter(
          (activity) => activity.deckId === deck._id.toString()
        ),
      }))
      .filter((deck) => deck.activities.length > 0);

    res.status(200).json(decksWithActivities);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
