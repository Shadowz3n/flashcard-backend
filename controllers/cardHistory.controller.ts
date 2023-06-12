import { Request, Response } from "express";
import { CardHistory } from "../models/cardHistory.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";

export const updateCardHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const cardId = req.params.id;
    const { direction } = req.body;

    if (direction !== "left" && direction !== "right") {
      res.status(400).json({ error: "Invalid direction value" });
      return;
    }

    const cardHistory = new CardHistory({
      userId,
      cardId,
      direction,
    });

    const savedCardHistory = await cardHistory.save();

    res.status(200).json(savedCardHistory);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getCardsByDeckIdWithHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { deckId } = req.params;
    const deck = await Deck.findById(deckId).lean().exec();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    const cardIds = deck.cards;
    const cards = await Card.find({ _id: { $in: cardIds } }).exec();

    const cardHistoryPromises = cardIds.map((cardId) =>
      CardHistory.find({ userId, cardId }).exec()
    );
    const cardHistories = await Promise.all(cardHistoryPromises);

    const cardsWithHistory = cards.map((card, index) => {
      const history = cardHistories[index].map((ch) => ({
        date: ch.date,
        direction: ch.direction,
      }));

      return {
        ...card.toObject(),
        history: history,
      };
    });

    res.status(200).json({ ...deck, cards: cardsWithHistory });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};