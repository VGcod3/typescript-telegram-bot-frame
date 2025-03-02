import { Pokemon } from "../../interfaces/pokemon";
import { PokemonDb } from "../../db/pokemon.db";
import { MessageType } from "../../modules/Sender";
import { BaseService } from "../base-scene/base.service";
import { faker } from "@faker-js/faker";
import { BotInstance } from "../../modules/BotInstance";
import { CallbackQuery } from "typescript-telegram-bot-api/dist/types";
import { FavoritesDb } from "../../db/favorites.db";
import { z } from "zod";

export class PokemonService extends BaseService {
  constructor(
    private readonly pokemonDb: PokemonDb,
    private readonly favoritesDb: FavoritesDb,
  ) {
    super();
  }

  public async createPokemon(message: MessageType) {
    const chatId = message.chat.id;

    const fakePokemon = this.generateRandomPokemon();

    this.sender.sendText(chatId, "Pokemon created");
    this.sender.sendText(chatId, JSON.stringify(fakePokemon, null, 2));

    return await this.pokemonDb.createPokemon(fakePokemon);
  }

  public async getPaginatedPokemons(message: MessageType) {
    const chatId = message.chat.id;

    const pokemon = await this.pokemonDb.getPaginatedPokemon({
      userId: chatId,
      skip: 0,
      take: 1,
    });

    console.log(pokemon);

    if (!pokemon) {
      this.sender.sendText(chatId, "No pokemons found");
      return;
    }

    const bot = BotInstance.getInstance();

    const pokemonCount = await this.pokemonDb.getPokemonCount();

    const sessionData = this.sessionManager.updateSessionData(chatId, {
      pokemonListPage: 0,
      pokemonCount,
    });

    const isLast = sessionData!.pokemonListPage === pokemonCount - 1;

    await bot.sendPhoto({
      chat_id: chatId,
      parse_mode: "HTML",
      photo: pokemon.image,
      caption: this.getPokemonView(pokemon),
      reply_markup: this.getInlinePaginationMarkup(
        pokemon.pokemonId,
        true,
        isLast,
        pokemon.isFavorited,
      ),
    });
  }

  private getPokemonView(pokemon: Pokemon) {
    return `<b>${pokemon.name}</b>
  <i>${pokemon.type}</i>
  <b>Level:</b> ${pokemon.level}
  <b>HP:</b> ${pokemon.hp}
  <b>Attack:</b> ${pokemon.attack}
  <b>Defense:</b> ${pokemon.defense}
  <b>Speed:</b> ${pokemon.speed}
    `;
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
        await this.handleAddToFavorites(callbackQuery);
        break;
      case "remove_from_favorites":
        this.handleRemoveFromFavorites(callbackQuery);
        break;
      case "previous":
        await this.handlePaginatePrevious(callbackQuery);
        break;
      case "next":
        await this.handlePaginateNext(callbackQuery);
        break;
      default:
        break;
    }
  }

  private async handlePaginateNext(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const sessionData = this.sessionManager.getSession(chatId)?.data || {};

    const parsePokemonCount = z.number().safeParse(sessionData?.pokemonCount);
    const parsePokemonListPage = z
      .number()
      .safeParse(sessionData?.pokemonListPage);

    const pokemonCount = parsePokemonCount.success ? parsePokemonCount.data : 0;
    const pokemonListPage = parsePokemonListPage.success
      ? parsePokemonListPage.data
      : 0;

    let isFirst = sessionData!.pokemonListPage === 0;
    let isLast = sessionData!.pokemonListPage === pokemonCount - 1;

    if (isLast) {
      this.sender.sendText(chatId, "No more items");
      return;
    }

    const newSession =
      this.sessionManager.updateSessionData(chatId, {
        pokemonListPage: pokemonListPage + 1,
      }) || {};

    const nextPokemon = await this.pokemonDb.getPaginatedPokemon({
      userId: chatId,
      skip: newSession!.pokemonListPage as number,
      take: 1,
    });

    console.log(nextPokemon);

    if (!nextPokemon) {
      this.sender.sendText(chatId, "No more items");
      return;
    }

    isFirst = newSession!.pokemonListPage === 0;
    isLast = newSession!.pokemonListPage === pokemonCount - 1;

    try {
      await BotInstance.getInstance().editMessageMedia({
        chat_id: chatId,
        message_id: callbackQuery.message!.message_id,
        media: {
          parse_mode: "HTML",
          type: "photo",
          media: nextPokemon.image,
          caption: this.getPokemonView(nextPokemon),
        },

        reply_markup: this.getInlinePaginationMarkup(
          nextPokemon.pokemonId,
          isFirst,
          isLast,
          nextPokemon.isFavorited,
        ),
      });
    } catch (error) {
      console.warn("Error editing message", error);
    }
  }

  private async handlePaginatePrevious(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const sessionData = this.sessionManager.getSession(chatId)?.data || {};

    const parsePokemonCount = z.number().safeParse(sessionData?.pokemonCount);
    const parsePokemonListPage = z
      .number()
      .safeParse(sessionData?.pokemonListPage);

    const pokemonCount = parsePokemonCount.success ? parsePokemonCount.data : 0;
    const pokemonListPage = parsePokemonListPage.success
      ? parsePokemonListPage.data
      : 0;

    z.number().parse(pokemonCount);

    let isFirst = sessionData.pokemonListPage === 0;
    let isLast = sessionData.pokemonListPage === pokemonCount - 1;

    if (isFirst) {
      this.sender.sendText(chatId, "It was the first item");
      return;
    }

    const newSession =
      this.sessionManager.updateSessionData(chatId, {
        pokemonListPage: pokemonListPage - 1,
      }) || {};

    const prevPokemon = await this.pokemonDb.getPaginatedPokemon({
      userId: chatId,
      skip: newSession.pokemonListPage as number,
      take: 1,
    });

    if (!prevPokemon) {
      this.sender.sendText(chatId, "It was the first item");
      return;
    }

    isFirst = newSession!.pokemonListPage === 0;
    isLast = newSession!.pokemonListPage === pokemonCount - 1;

    try {
      await BotInstance.getInstance().editMessageMedia({
        chat_id: chatId,
        message_id: callbackQuery.message!.message_id,
        media: {
          parse_mode: "HTML",
          type: "photo",
          media: prevPokemon.image,
          caption: this.getPokemonView(prevPokemon),
        },

        reply_markup: this.getInlinePaginationMarkup(
          prevPokemon.pokemonId,
          isFirst,
          isLast,
          prevPokemon.isFavorited,
        ),
      });
    } catch (error) {
      console.warn("Error editing message", error);
    }
  }

  private async handleAddToFavorites(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const data = JSON.parse(callbackQuery.data!);

    const favorite = await this.favoritesDb.createFavorite({
      pokemonId: data.id,
      userId: chatId,
    });

    if (!favorite) {
      this.sender.sendText(chatId, "Error adding to favorites");
      return;
    }

    this.sender.sendText(chatId, "Pokemon added to favorites");

    console.log("Favorite created", JSON.stringify(favorite, null, 2));
  }

  private async handleRemoveFromFavorites(callbackQuery: CallbackQuery) {
    const chatId = callbackQuery.message!.chat.id;

    const data = JSON.parse(callbackQuery.data!);

    await this.favoritesDb.deleteFavoriteByPokemonId(data.id, chatId);

    this.sender.sendText(chatId, "Pokemon removed from favorites");

    console.log("Favorite removed", data.id);
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
    } as Pokemon;
  }

  private getInlinePaginationMarkup(
    pokemonId: number,
    isFirst: boolean,
    isLast: boolean,
    isFavorited: boolean,
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
            text: isFavorited
              ? "❌ Remove from Favorites"
              : "⭐ Add to Favorites",
            callback_data: JSON.stringify({
              action: isFavorited
                ? "remove_from_favorites"
                : "add_to_favorites",
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
