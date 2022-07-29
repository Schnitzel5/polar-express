import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { Listener } from "./template";

const IS_NOT_NUMBER: RegExp = /[^\d.]+/;

export const data: Listener = {
    triggerEmoji: '🍆',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => {
        const num: number = parseFloat(reaction.message.cleanContent?.replace(IS_NOT_NUMBER, '').replace(/,/, '.') ?? '0');
        let result: number = Math.round(num / 2.54 * 100) / 100;
        reaction.message.channel.send(`Whoa! A ${result}incher!`);
    }
};
