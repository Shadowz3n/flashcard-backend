interface WeightedCard {
  cardId: string;
  weight: number;
}

export const weightedRandomSwap = (
  index: number,
  weightedCards: WeightedCard[]
): number => {
  let totalWeight = 0;
  for (let i = 0; i < index; i++) {
    totalWeight += weightedCards[i].weight;
  }

  const random = Math.random() * totalWeight;

  let weightSum = 0;
  for (let i = 0; i < index; i++) {
    weightSum += weightedCards[i].weight;
    if (random <= weightSum) {
      return i;
    }
  }

  return index - 1;
};
