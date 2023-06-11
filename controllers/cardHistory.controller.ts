import { Request, Response } from "express";
import { CardHistory } from "../models/cardHistory.model";

export const updateCardHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const cardId = req.params.id;
    const { direction } = req.body;

    if (direction !== "left" && direction !== "right") {
      res.status(400).json({ error: "Invalid direction value" });
      return;
    }

    const cardHistory = await CardHistory.findOneAndUpdate(
      { userId, cardId },
      { direction },
      { upsert: true, new: true }
    ).exec();

    res.status(200).json(cardHistory);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
