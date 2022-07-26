import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { Listener, mtl } from "./template";

export const data: Listener = {
    triggerEmoji: '🇩🇪',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => {
        mtl(reaction, user, client, 'DE');
    }
};
