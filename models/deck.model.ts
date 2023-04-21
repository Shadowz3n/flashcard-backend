import mongoose, { Document, Schema } from "mongoose";

export interface IDeck extends Document {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  cards: string[];
}

export const deckSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title field is required."],
    minlength: [1, "Title cannot be an empty string."],
  },
  description: {
    type: String,
    required: [true, "Description field is required."],
    minlength: [1, "Description cannot be an empty string."],
  },
  cards: [],
  createdAt: {
    type: Date,
    default: Date.now,
    required: [true, "Date field is required."],
  },
  updatedAt: { type: Date, default: Date.now },
});

export const Deck = mongoose.model<IDeck>("Deck", deckSchema);
