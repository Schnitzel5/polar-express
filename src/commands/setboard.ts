import { BaseCommandInteraction, CacheType, GuildMember } from "discord.js";
import { MongoClient } from "mongodb";
import { connectMongo, guildId } from "../app";
import build, { Command } from "./template";

export const data: Command = {
    command: build('setboard', 'Change the current values for a specific member', [
        { name: 'board', description: 'Name of the board', type: "String", required: true, autoComplete: true },
        { name: 'member', description: 'Member of this server', type: "User", required: true, autoComplete: false },
        { name: 'genesis', description: 'Amount of genesis crystals', type: "Integer", required: false, autoComplete: false },
        { name: 'monthly', description: 'Current duration of monthly', type: "Integer", required: false, autoComplete: false },
        { name: 'primogems', description: 'Amount of primogems', type: "Integer", required: false, autoComplete: false },
        { name: 'pity', description: 'Current pity since last 5*', type: "Integer", required: false, autoComplete: false },
        { name: 'guaranteed', description: 'You lost the 50/50?', type: "Boolean", required: false, autoComplete: false },
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        let options: any = interaction.options;
        let boardName: string = options.getString('board');
        let member: GuildMember = options.getMember('member');
        let genesis: number = options.getInteger('genesis');
        let monthly: number = options.getInteger('monthly');
        let primogems: number = options.getInteger('primogems');
        let pity: number = options.getInteger('pity');
        let guaranteed: number = options.getBoolean('guaranteed');
        await interaction.reply('...');
        connectMongo(client, () => {
            const boards = client.db('PolarExpressTM').collection("boards");
            boards.insertOne({
                'Board': boardName,
                'Guild': guildId,
                'Member': member.id,
                'Genesis': genesis,
                'Monthly': monthly,
                'Primogems': primogems,
                'Pity': pity,
                'Guaranteed': guaranteed
            }, (err) => {
                if (err) {
                    interaction.editReply('Failed to insert data! :(');
                    return;
                }
                interaction.editReply(`Data for leaderboard ${boardName} inserted! :)`);
                client.close();
            });
        });
    },
}