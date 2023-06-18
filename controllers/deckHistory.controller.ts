import { Request, Response } from "express";
import { DeckHistory } from "../models/deckHistory.model";
import { Deck } from "../models/deck.model";
import { Card } from "../models/card.model";

export const addDeckHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const deckId = req.params.deckId;

    const existingDeckHistory = await DeckHistory.findOne({
      userId,
      deckId,
    }).exec();

    if (existingDeckHistory) {
      res.status(400).json({ error: "Deck already added" });
      return;
    }

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

export const removeDeckHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const deckId = req.params.deckId;

    const deckHistory = await DeckHistory.findOneAndDelete({
      userId,
      deckId,
    }).exec();

    if (!deckHistory) {
      res.status(404).json({ error: "Deck history not found" });
      return;
    }

    res.status(200).json({ message: "Deck history removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
