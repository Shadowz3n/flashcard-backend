import { ICardHistory } from "../models/cardHistory.model";

interface CardScores {
  [cardId: string]: number;
}
export const calculateCardScore = (
  cardHistory: ICardHistory[],
  cardIds: string[]
) => {
  const cardScores: CardScores = {};

  cardIds.forEach((card) => {
    if (!cardScores[card]) {
      cardScores[card] = 0;
    }
  });

  cardIds.forEach((cardId) => {
    const cardEntries = cardHistory
      .filter((entry) => entry.cardId === cardId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    cardEntries.forEach((history) => {
      const { direction } = history;
      const score = cardScores[cardId] || 0;

      if (direction === "right") {
        cardScores[cardId] = score + 1;
      } else if (direction === "left") {
        cardScores[cardId] = score - 1;
      }
    });
  });

  return cardScores;
};
