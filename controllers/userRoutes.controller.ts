import { Request, Response } from "express";
import { Deck } from "../models/deck.model";
import { CardHistory, ICardHistory } from "../models/cardHistory.model";
import { Card } from "../models/card.model";
import { DeckHistory } from "../models/deckHistory.model";
import { addCardHistory } from "../utils/addCardHistory";
import { IUser, User } from "../models/user.model";
import {
  differenceInDays,
  formatISO,
  isSameDay,
  isToday,
  subDays,
} from "date-fns";
import { calculateCardScore } from "../utils/calculateCardScore";
import { weightedRandomSwap } from "../utils/randomizeWithScore";

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

export const getUserProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const deckHistory = await DeckHistory.find({ userId }).exec();
    const deckIds = deckHistory.map((history) => history.deckId);

    const decks = await Deck.find({
      $or: [{ createdBy: userId }, { _id: { $in: deckIds } }],
    }).exec();

    const cardIds = decks.flatMap((deck) => deck.cards);

    const totalCards = await Card.countDocuments({
      _id: { $in: cardIds },
    }).exec();

    const cardHistories = await CardHistory.find({ userId })
      .sort({ date: "desc" })
      .exec();
    const playedCardIds = [
      ...new Set(cardHistories.map((history) => history.cardId)),
    ];
    let playedCards = 0;

    const relatedDecks = await Deck.find({
      $or: [{ createdBy: userId }, { _id: { $in: deckIds } }],
    }).exec();

    playedCardIds.forEach((cardId) => {
      const isCardRelated = relatedDecks.some((deck) =>
        deck.cards.includes(cardId)
      );
      if (isCardRelated) {
        playedCards++;
      }
    });

    const lastCardHistory = cardHistories[0];
    if (lastCardHistory && lastCardHistory.direction === "right") {
      playedCards++;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let consecutiveDays = 0;
    let previousDate: Date | null = null;

    function isPreviousDay(date1: Date, date2: Date): boolean {
      const previousDate = subDays(date1, 1);
      return isSameDay(previousDate, date2);
    }

    cardHistories.forEach((history) => {
      const currentDate = new Date(history.date);
      if (previousDate) {
        const isConsecutiveDay = isPreviousDay(previousDate, currentDate);
        if (isConsecutiveDay) {
          consecutiveDays++;
        } else {
          consecutiveDays = 1;
        }
      } else {
        consecutiveDays = 1;
      }
      previousDate = currentDate;

      if (consecutiveDays > longestStreak) {
        longestStreak = consecutiveDays;
      }
      if (isToday(currentDate)) {
        currentStreak = consecutiveDays;
      }
    });

    const userProgress = {
      progress: {
        playedCards,
        totalCards,
      },
      streak: {
        currentStreak,
        longestStreak,
      },
    };

    res.status(200).json(userProgress);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const generateCards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const { deckId } = req.params;
    const deck = await Deck.findById(deckId).lean().exec();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    const cardIds = deck.cards;
    const cardHistoryPromises = cardIds.map((cardId) =>
      CardHistory.find({ userId, cardId }).exec()
    );
    const cardHistories = await Promise.all(cardHistoryPromises);
    const flattenedHistories = cardHistories.flat();

    const cardIdsWithRating = calculateCardScore(flattenedHistories, cardIds);

    const cardRatings = cardIds.map((cardId) => ({
      cardId,
      rating: cardIdsWithRating[cardId],
    }));

    const sortedCards = cardRatings.sort((a, b) => b.rating - a.rating);

    const sumOfRatings = sortedCards.reduce(
      (sum, card) => sum + card.rating,
      0
    );

    let lowerRange = 0;
    const weightedCards = sortedCards.map((card) => {
      const upperRange = lowerRange + card.rating / sumOfRatings;
      const weightedCard = {
        cardId: card.cardId,
        weight: upperRange - lowerRange,
      };
      lowerRange = upperRange;
      return weightedCard;
    });

    for (let i = weightedCards.length - 1; i > 0; i--) {
      const j = weightedRandomSwap(i + 1, weightedCards);
      [weightedCards[i], weightedCards[j]] = [
        weightedCards[j],
        weightedCards[i],
      ];
    }

    const studyCards = weightedCards
      .slice(0, 10)
      .map((weightedCard) => weightedCard.cardId);


    const findCards = await Card.find({ _id: { $in: studyCards } }).exec();

    const cards = findCards.map((card) => {
      const history = flattenedHistories
        .filter((ch) => ch.cardId === card._id.toString())
        .map((ch) => ({
          date: ch.date,
          direction: ch.direction,
        }));

      return {
        ...card.toObject(),
        history: history || [],
      };
    });

    res.status(200).json({ deckId, cards });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
