import { Request, Response } from "express";
import { DeckHistory } from "../models/deckHistory.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";

export const updateDeckHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const deckId = req.params.deckId;
    const deckHistory = new DeckHistory({
      userId,
      deckId,
    });

    const savedDeckHistory = await deckHistory.save();

    res.status(200).json(savedDeckHistory);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

