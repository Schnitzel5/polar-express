import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";

export interface Listener {
    triggerEmoji: string;
    execute: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => void;
}
