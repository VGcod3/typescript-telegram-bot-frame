# Telegram Pokemon Bot 🎮

A Telegram bot that allows users to collect, manage, and interact with Pokemon.
Built with TypeScript, Node.js, and MongoDB.

## Features 🌟

- **Pokemon Management**

  - Generate random Pokemon with unique stats
  - View Pokemon details (HP, Attack, Defense, Speed)
  - Navigate through Pokemon collection
  - Add/Remove Pokemon to favorites

- **Scene Management**

  - Home scene with main navigation
  - Pokemon scene for Pokemon-related actions
  - Settings scene for bot configuration

- **User System**
  - User session management
  - Persistent user preferences
  - Favorite Pokemon tracking

## Tech Stack 🛠

- TypeScript
- Node.js
- MongoDB (with Prisma ORM)
- Telegram Bot API
- Zod (for validation)
- Faker.js (for generating mock data)

## Prerequisites 📋

```bash
node >= 18.0.0
npm >= 9.0.0
MongoDB instance
```

## Installation 🚀

1. Clone the repository:

```bash
git clone <repository-url>
cd telegram-pokemon-bot
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Add your configuration:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=your_mongodb_connection_string
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Start the bot:

```bash
npm run dev    # Development mode
npm start      # Production mode
```

## Project Structure 📁

```
src/
├── db/                 # Database operations
├── enums/             # Enumerations
├── interfaces/        # TypeScript interfaces
├── modules/           # Core modules
├── scenes/            # Scene implementations
└── types/             # Type definitions
```

## Commands 💬

- `/start` - Initialize the bot
- `🏠 Home` - Return to home screen
- `🍑 Pokemon` - Access Pokemon features
- `⚙️ Settings` - Access bot settings

## Development 👨‍💻

Run tests:

```bash
npm run test
```

Check types and lint:

```bash
npm run check
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Acknowledgments 🙏

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
