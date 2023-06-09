import mongoose, { Document, Schema } from "mongoose";

export interface ICard extends Document {
  deckId: string;
  question: string;
  answer: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  category: string;

  reviewHistory: {
    date: Date;
    direction: string;
  }[];
  isAdded: boolean;
  isPrivate: boolean;
}

export const cardSchema: Schema = new mongoose.Schema({
  deckId: {
    type: String,
    required: [true, "Deck ID field is required."],
  },

  question: {
    type: String,
    required: [true, "Question field is required."],
    minlength: [1, "Question cannot be an empty string."],
  },

  answer: {
    type: String,
    required: [true, "Answer field is required."],
    minlength: [1, "Answer cannot be an empty string."],
  },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now },

  isAdded: { type: Boolean, default: true },
  category: { type: String, default: "uncategorized" },
  isPrivate: { type: Boolean, default: true },
});

export const Card = mongoose.model<ICard>("Card", cardSchema);
