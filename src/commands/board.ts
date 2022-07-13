import { EmbedBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CacheType, CommandInteractionOptionResolver } from "discord.js";
import build, { Command } from "./template";

export interface BoardData {
    guild: string;
    member: string;
    genesis: number;
    monthly: number;
    primo: number;
    pity: number;
    guaranteed: boolean;
}

export const data: Command = {
    command: build('board', 'Gives you a pong!', [
        { name: 'f2p', description: 'F2P/light spender category?', type: "Boolean", required: true }
    ]),
    execute: async function execute(interaction: BaseCommandInteraction<CacheType>) {
        let boardData: BoardData[] = generateRandomBoardData();
        let options: any = interaction.options;
        let ftwopCat: boolean = options.getBoolean('f2p');
        let embed: EmbedBuilder = new EmbedBuilder();
        embed.setColor([56, 76, 84]);
        embed.setTitle('Arly Funds Leaderboard');
        embed.setAuthor({
            name: 'The Polar Express™',
            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100',
            url: 'https://polarexpress-beta.web.app/welcome'
        });
        embed.setDescription(ftwopCat ? 'F2P + light spender category' : 'Whale category');
        embed.setThumbnail('https://cdn.discordapp.com/banners/992115669774635078/a_f3b461afc031173669ac827bcaa0edd0.webp?size=300');
        for (let board of boardData) {
            embed.addFields({ name: 'Name ' + board.member, value: 'Points ' + calculateTotalPoints(board), inline: false });
        }
        embed.setFooter({
            text: 'Fun Fact: Polar bear meat is yummy!',
            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100'
        });
        await interaction.reply({ embeds: [embed.toJSON()] });
    },
};

function generateRandomBoardData(): BoardData[] {
    let boardData: BoardData[] = [];
    for (let i = 0; i < 20; i++) {
        boardData.push({
            guild: '992115669774635078',
            member: 'mem' + i,
            genesis: getRndInteger(0, 30001),
            monthly: getRndInteger(0, 180),
            primo: getRndInteger(0, 300001),
            pity: getRndInteger(0, 89),
            guaranteed: getRndInteger(0, 2) == 1
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

function getRndInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}
