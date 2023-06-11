import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
}

export const userSchema: Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
