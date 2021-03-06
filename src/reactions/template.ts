import axios from "axios";
import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { connectMongo } from "../app";
import { URLSearchParams } from "url";

export interface Listener {
    triggerEmoji: string;
    execute: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => void;
}

export const mtl = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient, lang: string) => {
    if (process.env.DEEPLAUTHKEY == undefined) {
        await reaction.message.channel.send('No DeepL Auth Key provided! MTL failed!');
        return;
    }
    const text: string = reaction.message.content ?? '';
    let form: URLSearchParams = new URLSearchParams();
    form.append('auth_key', process.env.DEEPLAUTHKEY);
    form.append('text', text);
    form.append('target_lang', lang);
    const mtlURL: string = `https://api-free.deepl.com/v2/translate?auth_key=${process.env.DEEPLAUTHKEY}`;
    axios.post(mtlURL, form).then(async (res) => {
        if (res.status == 200) {
            const sourceDetected: string = res.data.translations[0].detected_source_language;
            const result: string = res.data.translations[0].text;
            console.log("MTL SourceLang: " + sourceDetected + " TargetLang: " + lang);
            console.log("MTL Result: \n" + result);
            await reaction.message.channel.send(result);
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