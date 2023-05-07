# Flashcard App Backend
This is the backend repository for the Flashcard Study App. It provides RESTful APIs for creating and managing user accounts, flashcard decks, and flashcards.

## Getting Started
To get started with the backend, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install the dependencies.
3. Create a `.env` file in the root directory and add the following environment variables:

```
MONGO_USER=<your_mongo_username>
MONGO_PASSWORD=<your_mongo_password>
```

4. Run npm start to start the server.
5. The server should be running on http://localhost:3000.

## Technologies Used
- Node.js
- Express
- MongoDB
- JWT

## Available APIs
### User Routes

POST /users - Create a new user
GET /api/users - Get all users
GET /api/users/:id - Get a user by ID
PUT /api/users/:id - Update a user by ID
DELETE /api/users/:id - Delete a user by ID
PUT /api/users/:id/progress - Update a user's flashcard progress by ID

### Card Routes
GET /api/cards - Get all flashcards
GET /api/decks/:deckId/cards - Get all flashcards in a specific deck
POST /api/cards - Create a new flashcard
PUT /api/cards/:id - Update a flashcard by ID
DELETE /api/cards/:id - Delete a flashcard by ID

### Deck Routes
GET /api/decks - Get all decks
POST /api/decks - Create a new deck
PUT /api/decks/:id - Update a deck by ID
DELETE /api/decks/:id - Delete a deck by ID
GET /api/decks/:deckId/cards/random/:quantity - Get a random selection of flashcards from a specific deck

## Acknowledgements
- This backend was built as part of a larger flashcard study app project. The frontend was built using React Native, Expo, and Native Base, and is available in a separate repository.
- The project was inspired by the flashcard study method, a popular technique for memorizing information.
- Thanks to the [Express](https://expressjs.com/), [Mongoose](https://mongoosejs.com/), and [jsonwebtoken](https://jwt.io/) communities for creating and maintaining the libraries used in this project
