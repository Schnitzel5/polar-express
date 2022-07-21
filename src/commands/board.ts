import { EmbedBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CacheType, Collection, GuildMember } from "discord.js";
import { MongoClient } from "mongodb";
import { connectMongo, discordClient, guildId, guildMembers } from "../app";
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
    added?: Date;
}

export const data: Command = {
    command: build('board', 'The good old rcord leaderboards!', [
        { name: 'name', description: 'Name of the board', type: "String", required: true, autoComplete: true }
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        // let boardData: BoardData[] = generateRandomBoardData();
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
        await interaction.deferReply();
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
                const tempBoards: Collection<string, BoardData> = new Collection();
                data.map(doc => {
                    let member = doc.Member;
                    let user: GuildMember | undefined = guildMembers.find(m => m.id === member);
                    if (user != undefined) {
                        member = user.displayName;
                    }
                    return {
                        boardName: doc.Board,
                        guild: doc.Guild,
                        member: member,
                        genesis: doc.Genesis ?? 0,
                        monthly: doc.Monthly ?? 0,
                        primo: doc.Primogems ?? 0,
                        pity: doc.Pity ?? 0,
                        guaranteed: doc.Guaranteed ?? 0,
                        added: new Date(doc.Added)
                    };
                }).forEach(board => {
                    let member = tempBoards.get(board.member);
                    if (member == undefined || member.added == undefined || member.added < board.added) {
                        tempBoards.set(board.member, board);
                    }
                });
                let boards: BoardData[] = [...tempBoards.values()];
                boards.sort((a, b) => {
                    let ba = calculateTotalPoints(a);
                    let bb = calculateTotalPoints(b);
                    return ba == bb ? 0 : ba < bb ? 1 : -1;
                }).slice(0, Math.min(boards.length, 20));
                for (let board of boards) {
                    embed.addFields({ name: board.member, value: calculateTotalPoints(board) + '', inline: false });
                }
                embed.setFooter({
                    text: 'Fun Fact: Polar bear meat is yummy!',
                    iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100'
                });
                await interaction.editReply({ embeds: [embed.toJSON()] });
            });
        });
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
