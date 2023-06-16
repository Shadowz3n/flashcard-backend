import { Request, Response } from "express";
import { Deck } from "../models/deck.model";
import { CardHistory } from "../models/cardHistory.model";
import { Card } from "../models/card.model";
import { DeckHistory } from "../models/deckHistory.model";
import { addCardHistory } from "../utils/addCardHistory";

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

    res.status(200).json(decksWithUserCardHistory);
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
