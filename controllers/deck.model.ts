import { Request, Response } from "express";

export const deckController = {
  async create(req, res) {
    try {
      const deck = await Deck.create(req.body);
      return res.status(201).json(deck);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  },

  async getById(req, res) {
    try {
      const deck = await Deck.findById(req.params.id);
      if (!deck) {
        return res.status(404).send("Deck not found");
      }
      return res.json(deck);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  },

  async update(req, res) {
    try {
      const deck = await Deck.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!deck) {
        return res.status(404).send("Deck not found");
      }
      return res.json(deck);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  },

  async delete(req, res) {
    try {
      const deck = await Deck.findByIdAndDelete(req.params.id);
      if (!deck) {
        return res.status(404).send("Deck not found");
      }
      return res.sendStatus(204);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  },
};
