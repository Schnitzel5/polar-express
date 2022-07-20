import { EmbedBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CacheType } from "discord.js";
import { MongoClient } from "mongodb";
import { connectMongo } from "../app";
import build, { Command } from "./template";

export interface BoardData {
    boardName: string;
    guild: string;
    member: string;
    genesis: number;
    monthly: number;
    primo: number;
    pity: number;
    guaranteed: boolean;
}

export const data: Command = {
    command: build('board', 'The good old rcord leaderboards!', [
        { name: 'name', description: 'Name of the board', type: "String", required: true, autoComplete: true }
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        let boardData: BoardData[] = generateRandomBoardData();
        let options: any = interaction.options;
        let boardName: string = options.getString('name');
        let embed: EmbedBuilder = new EmbedBuilder();
        embed.setColor([56, 76, 84]);
        embed.setTitle(boardName);
        embed.setAuthor({
            name: 'The Polar Express™',
            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100',
            url: 'https://polarexpress-beta.web.app/welcome'
        });
        embed.setDescription(boardName);
        embed.setThumbnail('https://cdn.discordapp.com/banners/992115669774635078/a_f3b461afc031173669ac827bcaa0edd0.webp?size=300');
        connectMongo(client, () => {
            const collection = client.db('PolarExpressTM').collection("boards");
            collection.find({ 'Board': boardName }).toArray(async (err, data) => {
                if (err) {
                    console.error("Leaderboard fetch failed: " + err.message);
                }
                if (data == undefined) {
                    await interaction.editReply('Failed to fetch leaderboard data.');
                    return;
                }
                const boards: BoardData[] = data.map(doc => {
                    return {
                        boardName: doc.Board,
                        guild: doc.Guild,
                        member: doc.Member,
                        genesis: doc.Genesis,
                        monthly: doc.Monthly,
                        primo: doc.Primogems,
                        pity: doc.Pity,
                        guaranteed: doc.Guaranteed
                    };
                });
                boards.sort((a, b) => {
                    let ba = calculateTotalPoints(a);
                    let bb = calculateTotalPoints(b);
                    return ba == bb ? 0 : ba < bb ? 1 : -1;
                });
                for (let board of boards) {
                    embed.addFields({ name: 'Name ' + board.member, value: 'Points ' + calculateTotalPoints(board), inline: false });
                }
            });
        });
        embed.setFooter({
            text: 'Fun Fact: Polar bear meat is yummy!',
            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100'
        });
        await interaction.reply({ embeds: [embed.toJSON()] }); // integrate mongodb
    },
};

function generateRandomBoardData(): BoardData[] {
    let boardData: BoardData[] = [];
    for (let i = 0; i < 20; i++) {
        boardData.push({
            boardName: 'Test Board F2P',
            guild: '992115669774635078',
            member: 'mem' + i,
            genesis: getRandom(0, 30001),
            monthly: getRandom(0, 180),
            primo: getRandom(0, 300001),
            pity: getRandom(0, 89),
            guaranteed: getRandom(0, 2) == 1
        });
    }
    boardData.sort((a, b) => {
        let ba = calculateTotalPoints(a);
        let bb = calculateTotalPoints(b);
        return ba == bb ? 0 : ba < bb ? 1 : -1;
    });
    return boardData;
}

function calculateTotalPoints(board: BoardData): number {
    let totalRawGems = board.genesis + board.primo;
    let totalMonthly = board.monthly * 90;
    let totalPity = (board.pity + (board.guaranteed ? 90 : 0)) * 160;
    return totalRawGems + totalMonthly + totalPity;
}

export function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}
