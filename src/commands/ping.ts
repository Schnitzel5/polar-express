import { BaseCommandInteraction, CacheType } from "discord.js";
import build, { Command } from "./template";

export const data: Command = {
    command: build('ping', 'Gives you a pong!', []),
    execute: async function execute(interaction: BaseCommandInteraction<CacheType>) {
        await interaction.reply('Pong!');
    },
};
