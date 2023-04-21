import mongoose, { Document, Schema } from "mongoose";

export interface ICard extends Document {
  deckId: string;
  question: string;
  answer: string;
  userDifficulty: number;
  lastReviewed: Date;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
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

  userDifficulty: {
    type: Number,
    default: 0,
    min: [0, "User difficulty must be a number from 0 - 3."],
    max: [3, "User difficulty must be a number from 0 - 3."],
  },

  lastReviewed: { type: Date },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date },

  isFavorite: { type: Boolean, default: false },
});

export const Card = mongoose.model<ICard>("Card", cardSchema);
