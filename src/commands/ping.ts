import { BaseCommandInteraction, CacheType } from "discord.js";
import { MongoClient } from "mongodb";
import build, { Command } from "./template";

export const data: Command = {
    command: build('ping', 'Gives you a pong!', []),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        await interaction.reply('Pong!');
    },
};
