import mongoose, { Document, Schema } from "mongoose";

export interface ICard extends Document {
  deckId: string;
  question: string;
  answer: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
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

  createdBy: {
    type: String,
    required: [true, "Created by field is required."],
  },

  updatedAt: { type: Date, default: null },
  updatedBy: {
    type: String,
    default: null,
  },

  isAdded: { type: Boolean, default: true },
  isPrivate: { type: Boolean, default: true },
});

export const Card = mongoose.model<ICard>("Card", cardSchema);
