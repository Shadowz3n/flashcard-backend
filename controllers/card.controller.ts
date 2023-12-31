import { Request, Response } from "express";
import { Card, ICard } from "../models/card.model";
import { Deck } from "../models/deck.model";
import { User } from "../models/user.model";
import { CardHistory } from "../models/cardHistory.model";

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
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ error: "Access denied" });
      return;
    }

    const { deckId } = req.params;
    const deck = await Deck.findById(deckId).lean().exec();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    const cardIds = deck.cards;
    const cards = await Card.find({ _id: { $in: cardIds } }).exec();

    res.status(200).json({ ...deck, cards: cards });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const createCard = async (
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
    const { deckId, question, answer } = req.body;
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    if (deck.cards === undefined) {
      throw new Error("Deck cards array is undefined");
    }

    const card: ICard = new Card({
      deckId,
      question,
      answer,
      createdBy: userId,
    });
    const newCard: ICard = await card.save();
    deck.cards.push(newCard._id);
    await deck.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const createMultipleCards = async (
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

    const { deckId, cards } = req.body;
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    if (deck.cards === undefined) {
      throw new Error("Deck cards array is undefined");
    }

    const createdCards: ICard[] = [];
    for (const { question, answer } of cards) {
      const card: ICard = new Card({
        deckId,
        question,
        answer,
        createdBy: userId,
      });
      const newCard: ICard = await card.save();
      deck.cards.push(newCard._id);
      createdCards.push(newCard);
    }

    await deck.save();
    res.status(201).json(createdCards);
  } catch (err) {
    res.status(500).send(err);
  }
};


export const updateCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cardId = req.params.id;
    const userId = req.user?.id;

    const updatedCard: ICard | null = await Card.findByIdAndUpdate(
      cardId,
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: userId,
      },
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
    const cardId = req.params.id;
    const findCard: ICard | null = await Card.findByIdAndDelete(cardId).exec();
    if (findCard) {
      const deckId = findCard.deckId;
      // await CardHistory.deleteMany({ cardId });

      const deck = await Deck.findById(deckId);
      if (!deck) {
        res.status(404).send("Deck not found");
        return;
      }
      await Deck.updateMany(
        { cards: findCard._id },
        { $pull: { cards: findCard._id } }
      ).exec();

      res.status(200).json(findCard);
    } else {
      res.status(404).send("Card not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

