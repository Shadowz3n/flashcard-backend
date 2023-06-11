import { Request, Response } from "express";
import { Deck, IDeck } from "../models/deck.model";
import { Card, ICard } from "../models/card.model";
import { User } from "../models/user.model";

export const getAllDecks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const decks: IDeck[] = await Deck.find().exec();
    res.status(200).json(decks);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const createDeck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ error: "Access denied" });
      return;
    }
    const { name, description } = req.body;
    const deck: IDeck = new Deck({
      name,
      description,
      cards: [],
      createdBy: userId,
    });

    const newDeck: IDeck = await deck.save();
    res.status(201).json(newDeck);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const updateDeck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const deckId = req.params.id;

    const updatedDeck: IDeck | null = await Deck.findByIdAndUpdate(
      deckId,
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true }
    ).exec();
    res.status(200).json(updatedDeck);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const deleteDeck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedDeck: IDeck | null = await Deck.findByIdAndDelete(
      req.params.id
    ).exec();

    if (deletedDeck) {
      await Card.deleteMany({ deckId: deletedDeck._id });
      res.status(200).json(deletedDeck);
    } else {
      res.status(404).send("Deck not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};