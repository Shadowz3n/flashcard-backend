import { Card } from "../models/card.model";
import { CardHistory } from "../models/cardHistory.model";
import { IDeck } from "../models/deck.model";

export async function addCardHistory(decks: IDeck[], userId: string) {
  const cardIds = decks.map((deck) => deck.cards).flat();
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
  const updatedDecks = decks.map((deck) => {
    const updatedCards = deck.cards.map((cardId) =>
      cardsWithHistory.find((card) => card._id.toString() === cardId)
    );

    const copiedDeck = JSON.parse(JSON.stringify(deck));
    copiedDeck.cards = updatedCards;

    return copiedDeck;
  });

  return updatedDecks;
}
