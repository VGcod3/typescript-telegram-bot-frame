import { PokemonService } from "./pokemon.service";
import { MessageType } from "../../modules/Sender";
import { BaseController } from "../base-scene/base.controller";
import { SceneEnum } from "../../enums/SceneEnum";
import { CallbackQuery } from "typescript-telegram-bot-api/dist/types";

export class PokemonController extends BaseController<PokemonService> {
  constructor(sceneService: PokemonService) {
    super(sceneService);

    this.bot.on("callback_query", (callbackQuery) => {
      this.handleCallbackQuery(callbackQuery);
    });
  }

  protected async handleTextMessage(message: MessageType) {
    if (message.text === SceneEnum.GeneratePokemon) {
      await this.sceneService.createPokemon(message);
    } else if (message.text === SceneEnum.GetAllPokemons) {
      await this.sceneService.getPaginatedPokemons(message);
    }
    this.sceneService.handleKeyboard(message);
  }

  private async handleCallbackQuery(callbackQuery: CallbackQuery) {
    this.sceneService.handleCallbackQuery(callbackQuery);
  }
}
