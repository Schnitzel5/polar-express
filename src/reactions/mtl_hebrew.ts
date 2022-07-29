import axios from "axios";
import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { URLSearchParams } from "url";
import { connectMongo } from "../app";
import { Listener } from "./template";

export const data: Listener = {
    triggerEmoji: '🇮🇱',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => {
        const text: string = reaction.message.content ?? '';
        let form: URLSearchParams = new URLSearchParams();
        form.append('', text);
        const mtlURL: string = `https://duckduckgo.com/translation.js?vqd=3-306826030276211037926720422115307361214-305698686304503493873277097345061330313&query=translate to hebrew&to=he`;
        axios.post(mtlURL, form).then(async (res) => {
            if (res.status == 200) {
                const sourceDetected: string = res.data.detected_language;
                const result: string = res.data.translated;
                console.log("MTL SourceLang: " + sourceDetected + " TargetLang: Hebrew");
                console.log("MTL Result: \n" + result);
                await reaction.message.channel.send({ content: result });
            } else {
                await reaction.message.channel.send('DeepL MTL failed!');
            }
        }).catch(async err => {
            console.error(err);
            await reaction.message.channel.send('MTL request failed!');
        });
        connectMongo(client, () => {
            const collection = client.db('PolarExpressTM').collection("logsReactions");
            collection.insertOne({
                'ReactionDate': new Date().toString(),
                'ReactionID': reaction.emoji.id,
                'ReactionName': reaction.emoji.name,
                'ReactorTag': user.tag,
                'ReactorUsername': user.username
            }, (err) => {
                if (err) {
                    console.error("Log reaction failed: " + err.message);
                }
            });
        });
    }
};
