import { Request, Response } from "express";
import { Deck, IDeck } from "../models/deck.model";
import { Card } from "../models/card.model";

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
    const deck: IDeck = new Deck({
      title: req.body.title,
      description: req.body.description,
      collectionId: req.body.collectionId,
      cards: [],
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
    const updatedDeck: IDeck | null = await Deck.findByIdAndUpdate(
      req.params.id,
      req.body,
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
