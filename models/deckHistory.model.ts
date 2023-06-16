import mongoose from "mongoose";

export interface IDeckHistory {
  userId: string;
  deckId: string;
  addedAt: boolean;
  removedAt: boolean;
}

export const deckHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID field is required."],
  },
  deckId: {
    type: String,
    required: [true, "Deck ID field is required."],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  removedAt: {
    type: Date,
    default: null,
  },
});

export const DeckHistory = mongoose.model<IDeckHistory>(
  "DeckHistory",
  deckHistorySchema
);
