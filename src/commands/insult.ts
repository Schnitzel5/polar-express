import { BaseCommandInteraction, CacheType } from "discord.js";
import { MongoClient } from "mongodb";
import { connectMongo } from "../app";
import { getRandom } from "./board";
import build, { Command } from "./template";

export const data: Command = {
    command: build('insult', 'Sends an insult quote', [
        { name: 'add', description: 'Add an insult quote', type: "String", required: false, autoComplete: false }
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        let options: any = interaction.options;
        let quote: string = options.getString('add');
        await interaction.reply('...');
        connectMongo(client, () => {
            const collection = client.db('PolarExpressTM').collection("quotes");
            if (quote != null && quote != undefined) {
                collection.insertOne({
                    'Quote': quote
                }, (err) => {
                    if (err) {
                        console.error("Quote insertion failed: " + err.message);
                        interaction.editReply('Quote couldn\' be inserted!');
                        return;
                    }
                    interaction.editReply('Quote inserted!');
                });
                return;
            }
            collection.find({}).project({ 'Quote': 1 }).toArray(async (err, data) => {
                if (err) {
                    console.error("Quotes fetch failed: " + err.message);
                }
                try {
                    let quotes: string[] = [];
                    if (data != undefined) {
                        quotes = data.map(doc => doc.Quote);
                    }
                    if (quotes.length == 0) {
                        await interaction.editReply('Kaze moment.');
                        return;
                    }
                    let idx: number = getRandom(0, quotes.length);
                    let quote: string = quotes[idx];
                    console.log(idx);
                    await interaction.editReply(quote);
                } catch (err) {
                    console.error(`Error responding slash command: ${err}`);
                }
            });
        });
    }
}