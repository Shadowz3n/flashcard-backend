import mongoose, { Document, Schema } from "mongoose";
import { ICard, cardSchema } from "./card.model";

export interface IDeck extends Document {
  name: string;
  description: string;
  cards: ICard[];
  dateCreated: Date;
  lastModified: Date;
}

const deckSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required."],
    minlength: [1, "Name cannot be an empty string."],
  },
  description: {
    type: String,
    required: [true, "Description field is required."],
    minlength: [1, "Description cannot be an empty string."],
  },
  cards: [cardSchema],
  dateCreated: {
    type: Date,
    default: Date.now,
    required: [true, "Date field is required."],
  },
  lastModified: { type: Date, default: Date.now },
});

export const Deck = mongoose.model<IDeck>("Deck", deckSchema);
