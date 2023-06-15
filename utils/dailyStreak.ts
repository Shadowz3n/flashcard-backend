import { CardHistory } from "../models/cardHistory.model";

export const calculateDailyStreak = async (userId: string): Promise<number> => {
  const cardHistory = await CardHistory.find({ userId }).exec();
  const cardHistorySorted = cardHistory.sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });

  const modifiedCardHistory = cardHistorySorted.map((ch) => {
    const modifiedDate = new Date(ch.date);
    modifiedDate.setHours(0, 0, 0, 0);
    modifiedDate.setDate(modifiedDate.getDate() + 1);
    return { ...ch, date: modifiedDate };
  });

  let daysInARow = 0;
  let currentStreak = 0;
  let lastDate = new Date();

  modifiedCardHistory.forEach((ch) => {
    const currentDate = new Date(ch.date);

    if (
      lastDate.getFullYear() === currentDate.getFullYear() &&
      lastDate.getMonth() === currentDate.getMonth() &&
      lastDate.getDate() === currentDate.getDate()
    ) {
      currentStreak++;
    } else if (
      lastDate.getDate() === currentDate.getDate() - 1 &&
      lastDate.getMonth() === currentDate.getMonth() &&
      lastDate.getFullYear() === currentDate.getFullYear()
    ) {
      currentStreak++;
      daysInARow++;
    } else {
      currentStreak = 1;
    }

    lastDate = currentDate;
  });

  return daysInARow;
};
