import mongoose, { ObjectId, Schema } from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  cards: IUserCard[];
}

export interface IUserCard {
  cardId: ObjectId;
  history: {
    date: Date;
    userDifficulty: number;
  }[];
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
  cards: [
    {
      cardId: {
        type: Schema.Types.ObjectId,
        ref: "Card",
        required: true,
      },
      history: [
        {
          date: {
            type: Date,
            default: Date.now,
          },
          userDifficulty: {
            type: Number,
            default: 0,
            min: [0, "Difficulty must be a number from 0 - 3."],
            max: [3, "Difficulty must be a number from 0 - 3."],
          },
        },
      ],
    },
  ],
});

userSchema.pre<IUser>("save", function (next) {
  if (!this.cards) {
    this.cards = [];
  }
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);

// import mongoose, { Schema } from "mongoose";

// export interface IUser extends mongoose.Document {
//   username: string;
//   email: string;
//   password: string;
// }

// export const userSchema: Schema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// export const User = mongoose.model<IUser>("User", userSchema);
