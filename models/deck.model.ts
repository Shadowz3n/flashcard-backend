import mongoose, { Document, Schema } from "mongoose";

export interface IDeck extends Document {
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  cards: string[];
  category: string;
  isPrivate: boolean;
  isAdded: boolean;
}

export const deckSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required."],
    minlength: [1, "Name cannot be empty."],
  },
  description: {
    type: String,
    required: [true, "Description field is required."],
    minlength: [1, "Description cannot be empty."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: [true, "Created by field is required."],
  },
  cards: {
    type: [String],
    default: [],
  },
  updatedAt: { type: Date, default: null },
  updatedBy: {
    type: String,
    default: null,
  },
  category: { type: String, default: "uncategorized" },
  isPrivate: { type: Boolean, default: true },
  isAdded: { type: Boolean, default: true },
});

export const Deck = mongoose.model<IDeck>("Deck", deckSchema);
