import { Request, Response } from "express";
import { Card, ICard } from "../models/card.model";

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

export const createCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const card: ICard = new Card(req.body);
    const newCard: ICard = await card.save();
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
    res.status(200).json(updatedCard);
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
    res.status(200).json(deletedCard);
  } catch (err) {
    res.status(500).send(err);
  }
};
