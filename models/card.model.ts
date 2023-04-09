import mongoose, { Document, Schema } from "mongoose";

export interface ICard extends Document {
  question: string;
  answer: string;
  category: string;
  difficulty: number;
  dateCreated: Date;
  lastModified: Date;
}

export const cardSchema: Schema = new mongoose.Schema({
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
  category: { type: String, required: [true, "Category field is required."] },
  difficulty: {
    type: Number,
    required: [true, "Difficulty field is required."],
    min: [0, "Difficulty must be a number from 0 - 4."],
    max: [4, "Difficulty must be a number from 0 - 4."],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    required: [true, "Date field is required."],
  },
  lastModified: { type: Date, default: Date.now },
});

export const Card = mongoose.model<ICard>("Card", cardSchema);
