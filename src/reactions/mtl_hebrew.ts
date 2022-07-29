import axios from "axios";
import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { MongoClient } from "mongodb";
import { Listener } from "./template";

export const data: Listener = {
    triggerEmoji: '🇮🇱',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: MongoClient) => {
        const text: string = reaction.message.cleanContent ?? '';
        let preForm: URLSearchParams = new URLSearchParams();
        preForm.append('text_to_translate', text);
        const autoDetectURL: string = `https://www.translate.com/translator/ajax_lang_auto_detect`;
        axios.post(autoDetectURL, preForm).then(async (res) => {
            if (res.status == 200) {
                const lang: string = res.data.language;
                const mtlURL: string = `https://www.translate.com/translator/translate_mt`;
                let form: URLSearchParams = new URLSearchParams();
                form.append('text_to_translate', text);
                form.append('source_lang', lang);
                form.append('translated_lang', 'iw');
                form.append('use_cache_only', 'false');
                axios.post(mtlURL, form).then(async (res) => {
                    if (res.status == 200) {
                        const result: string = res.data.translated_text;
                        await reaction.message.channel.send(result);
                    } else {
                        await reaction.message.channel.send('MTL process failed!');
                    }
                }).catch(console.log);
            } else {
                await reaction.message.channel.send('Auto detection failed!');
            }
        }).catch(console.log);
    }
};
