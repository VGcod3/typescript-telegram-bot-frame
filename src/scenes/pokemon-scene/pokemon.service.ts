import { Pokemon } from "../../interfaces/pokemon";
import { PokemonDb } from "../../db/pokemon.utils";
import { MessageType } from "../../modules/Sender";
import { BaseService } from "../base-scene/base.service";
import { faker } from "@faker-js/faker";
import { BotInstance } from "../../modules/BotInstance";
import { CallbackQuery } from "typescript-telegram-bot-api/dist/types";

export class PokemonService extends BaseService {
  constructor(private readonly pokemonDb: PokemonDb) {
    super();
  }

  public async createPokemon(message: MessageType) {
    const chatId = message.chat.id;

    const fakePokemon = this.generateRandomPokemon();

    this.sender.sendText(chatId, "Pokemon created");
    this.sender.sendText(chatId, JSON.stringify(fakePokemon, null, 2));

    return await this.pokemonDb.createPokemon(fakePokemon);
  }

  public async getAllPokemons(message: MessageType) {
    const chatId = message.chat.id;

    const pokemons = await this.pokemonDb.getAllPokemons({
      skip: 0,
      take: 1,
    });

    const bot = BotInstance.getInstance();

    const sessionData = this.sessionManager.updateSessionData(chatId, {
      pokemons,
      pokemonListPage: 0,
    });

    const isLast = sessionData!.pokemonListPage === 2;

    await bot.sendMessage({
      chat_id: chatId,
      text: JSON.stringify(pokemons![0], null, 2),
      reply_markup: this.getInlinePaginationMarkup(
        pokemons![0].pokemonId,
        true,
        isLast,
      ),
    });
  }

  public async handleCallbackQuery(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const data = JSON.parse(callbackQuery.data!);

    switch (data.action) {
      case "refresh":
        this.sender.sendText(chatId, "Refreshing...");
        break;
      case "view":
        this.sender.sendText(chatId, "Viewing...");
        break;
      case "add_to_favorites":
        this.sender.sendText(chatId, "Adding to favorites...");
        break;
      case "previous":
        await this.handlepaginatePrevious(callbackQuery);
        // this.sender.sendText(chatId, "Previous...");
        break;
      case "next":
        await this.handlepaginateNext(callbackQuery);
        // this.sender.sendText(chatId, "Next...");

        break;
      default:
        break;
    }
  }

  private async handlepaginateNext(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const sessionData = this.sessionManager.getSession(chatId)?.data;

    let isFirst = sessionData!.pokemonListPage === 0;
    let isLast = sessionData!.pokemonListPage === 2;

    if (isLast) {
      this.sender.sendText(chatId, "No more pokemons");
      return;
    }

    const newSession = this.sessionManager.updateSessionData(chatId, {
      pokemonListPage: sessionData!.pokemonListPage + 1,
    });

    const nextPokemon = (
      await this.pokemonDb.getAllPokemons({
        skip: newSession!.pokemonListPage,
        take: 1,
      })
    )?.[0];

    if (!nextPokemon) {
      this.sender.sendText(chatId, "No more pokemons");
      return;
    }

    isFirst = newSession!.pokemonListPage === 0;
    isLast = newSession!.pokemonListPage === 2;

    try {
      await BotInstance.getInstance().editMessageText({
        chat_id: chatId,
        message_id: callbackQuery.message!.message_id,
        text: JSON.stringify(nextPokemon, null, 2),
        reply_markup: this.getInlinePaginationMarkup(
          nextPokemon.pokemonId,
          isFirst,
          isLast,
        ),
      });
    } catch (error) {
      console.warn("Error editing message", error);
    }
  }

  private async handlepaginatePrevious(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const sessionData = this.sessionManager.getSession(chatId)?.data;

    let isFirst = sessionData!.pokemonListPage === 0;
    let isLast = sessionData!.pokemonListPage === 2;

    if (isFirst) {
      this.sender.sendText(chatId, "It was the first pokemon");
      return;
    }

    const newSession = this.sessionManager.updateSessionData(chatId, {
      pokemonListPage: sessionData!.pokemonListPage - 1,
    });

    const nextPokemon = (
      await this.pokemonDb.getAllPokemons({
        skip: newSession!.pokemonListPage,
        take: 1,
      })
    )?.[0];

    if (!nextPokemon) {
      this.sender.sendText(chatId, "It was the first pokemon");
      return;
    }

    isFirst = newSession!.pokemonListPage === 0;
    isLast = newSession!.pokemonListPage === 2;

    try {
      await BotInstance.getInstance().editMessageText({
        chat_id: chatId,
        message_id: callbackQuery.message!.message_id,
        text: JSON.stringify(nextPokemon, null, 2),
        reply_markup: this.getInlinePaginationMarkup(
          nextPokemon.pokemonId,
          isFirst,
          isLast,
        ),
      });
    } catch (error) {
      console.warn("Error editing message", error);
    }
  }

  private generateRandomPokemon(): Pokemon {
    return {
      pokemonId: faker.number.int(),
      image: faker.image.urlPicsumPhotos(),
      name: faker.animal.lion(),
      type: faker.animal.type(),
      level: faker.number.int({
        min: 1,
        max: 100,
      }),
      hp: faker.number.int({
        min: 1,
        max: 100,
      }),
      attack: faker.number.int({
        min: 1,
        max: 100,
      }),
      defense: faker.number.int({
        min: 1,
        max: 100,
      }),
      speed: faker.number.int({
        min: 1,
        max: 100,
      }),
    };
  }

  private getInlinePaginationMarkup(
    pokemonId: number,
    isFirst: boolean,
    isLast: boolean,
  ) {
    const paginationButtons: {
      text: string;
      callback_data: string;
    }[] = [];

    if (!isFirst) {
      paginationButtons.push({
        text: "⬅️ Previous",
        callback_data: JSON.stringify({
          action: "previous",
        }),
      });
    }

    if (!isLast) {
      paginationButtons.push({
        text: "➡️ Next",
        callback_data: JSON.stringify({
          action: "next",
        }),
      });
    }

    return {
      inline_keyboard: [
        [
          {
            text: "⭐ Add to Favorites",
            callback_data: JSON.stringify({
              action: "add_to_favorites",
              id: pokemonId,
            }),
          },
        ],
        [
          {
            text: "🔄 Refresh",

            callback_data: JSON.stringify({
              action: "refresh",
            }),
          },

          {
            text: "🔍 View",
            callback_data: JSON.stringify({
              action: "view",
              id: pokemonId,
            }),
          },
        ],

        paginationButtons,
      ],
    };
  }
}
