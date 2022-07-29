import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { Listener } from "./template";

const IS_NOT_NUMBER: RegExp = /\D+/;

export const data: Listener = {
    triggerEmoji: '🍆',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => {
        const num: number = parseInt(reaction.message.cleanContent?.replace(IS_NOT_NUMBER, '') ?? '0');
        let result: number = num % 2.54;
        reaction.message.channel.send(`Whoa! A ${result}incher!`);
    }
};
