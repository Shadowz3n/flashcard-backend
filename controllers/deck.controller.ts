import { Request, Response } from "express";
import { Deck, IDeck } from "../models/deck.model";
import { Card, ICard } from "../models/card.model";
import { IUserCard, User } from "../models/user.model";

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

export const getRandomCardsFromDeck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deckId, quantity } = req.params;
    const { userId } = req.body;

    const deck = await Deck.findById(deckId).exec();
    if (!deck) {
      res.status(404).send("Deck not found");
      return;
    }

    const cards = deck.cards;

    let selectedCards: ICard[] = [];

    if (cards.length <= parseInt(quantity, 10)) {
      selectedCards = await Promise.all(
        cards.map(async (cardId) => {
          const card = await Card.findById(cardId).exec();
          if (!card) {
            throw new Error(`Card with id ${cardId} not found`);
          }
          return card;
        })
      );
    } else {
      const shuffledCards = cards.sort(() => 0.5 - Math.random());
      selectedCards = await Promise.all(
        shuffledCards.slice(0, parseInt(quantity, 10)).map(async (cardId) => {
          const card = await Card.findById(cardId).exec();
          if (!card) {
            throw new Error(`Card with id ${cardId} not found`);
          }
          return card;
        })
      );
    }

    if (userId) {
      const user = await User.findById(userId).exec();
      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      const currentDate = new Date();
      selectedCards.map((card) => {
        const userCard = user.cards.find(
          (userCard) => userCard.cardId.toString() === card._id.toString()
        );
        if (userCard) {
          const getUserDifficultyByLatestHistory = userCard.history
            .filter((h) => h.date <= currentDate)
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
          if (getUserDifficultyByLatestHistory) {
            card.userDifficulty =
              getUserDifficultyByLatestHistory.userDifficulty;
          } else {
            card.userDifficulty = 0;
          }
        }
      });
    }

    const response = selectedCards;
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

