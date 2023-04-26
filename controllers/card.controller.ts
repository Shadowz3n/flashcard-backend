import { Request, Response } from "express";
import { Card, ICard } from "../models/card.model";
import { Deck } from "../models/deck.model";
import { Document } from "mongoose";
import { IDeck } from "../models/deck.model";
import { User } from "../models/user.model";

export const getAllCards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cards: ICard[] = await Card.find().exec();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getAllCardsByDeckId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deckId } = req.params;
    const deck = await Deck.findById(deckId).lean().exec();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    const cardIds = deck.cards;
    const cards = await Card.find({ _id: { $in: cardIds } }).exec();

    const deckTitle = deck.title;
    const deckDescription = deck.description;

    res.status(200).json({ deckTitle, deckDescription, cards });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getAllCardsByDifficulty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send("Unauthorized");
      return;
    }
    const currentDate = new Date();
    const user = await User.findById(userId).exec();
    const cards: ICard[] = await Card.find().exec();

    const cardsByDifficulty = cards.reduce(
      (acc: { difficulty: number; cards: ICard[] }[], card) => {
        const userCard = user?.cards.find(
          (userCard) => userCard.cardId.toString() === card.id.toString()
        );
        const difficulty = userCard
          ? userCard.history
              .filter((h) => h.date <= currentDate)
              .sort((a, b) => b.date.getTime() - a.date.getTime())[0]
              .userDifficulty
          : 0;

        const existingDifficulty = acc.find((c) => c.difficulty === difficulty);

        if (existingDifficulty) {
          existingDifficulty.cards.push(card);
        } else {
          acc.push({ difficulty, cards: [card] });
        }

        return acc;
      },
      []
    );

    res.status(200).json(cardsByDifficulty);
  } catch (err) {
    res.status(500).send(err);
  }
};



export const createCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deckId, question, answer } = req.body;
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    const card: ICard = new Card({ deckId, question, answer });
    const newCard: ICard = await card.save();

    deck.cards.push(newCard._id);
    await deck.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const updateCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedCard: ICard | null = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).exec();
    if (updatedCard) {
      res.status(200).json(updatedCard);
    } else {
      res.status(404).send("Card not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedCard: ICard | null = await Card.findByIdAndDelete(
      req.params.id
    ).exec();
    if (deletedCard) {
      const deckId = deletedCard.deckId;
      const cardId = deletedCard._id;

      const deck = await Deck.findById(deckId);
      if (!deck) {
        res.status(404).send("Deck not found");
        return;
      }
      await Deck.updateMany(
        { cards: deletedCard._id },
        { $pull: { cards: deletedCard._id } }
      ).exec();



      res.status(200).json(deletedCard);
    } else {
      res.status(404).send("Card not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

