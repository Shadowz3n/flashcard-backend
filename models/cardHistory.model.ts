import mongoose from "mongoose";

export interface ICardHistory extends Document {
  userId: string;
  cardId: string;
  date: Date;
  direction: "left" | "right";
}

export const cardHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID field is required."],
  },
  cardId: {
    type: String,
    required: [true, "Card ID field is required."],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  direction: {
    type: String,
    enum: ["left", "right"],
    required: [true, "Direction field is required."],
  },
});

export const CardHistory = mongoose.model<ICardHistory>(
  "CardHistory",
  cardHistorySchema
);
