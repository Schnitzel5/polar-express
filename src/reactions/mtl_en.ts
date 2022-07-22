import axios from "axios";
import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import FormData from "form-data";
import { escape } from "querystring";
import { URLSearchParams } from "url";
import { Listener } from "./template";

export const data: Listener = {
    triggerEmoji: '🇺🇸',
    execute: async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        const text: string = reaction.message.content ?? '';
        const autoDetectURL: string = `https://translate.yandex.net/api/v1/tr.json/detect?sid=011f69ca.62da9350.9a02e657.74722d74657874&srv=tr-text&text=${encodeURI(text)}&options=1&yu=4678998311658491538`;
        axios.get(autoDetectURL).then(async (res) => {
            if (res.status == 200) {
                const lang: string = res.data.lang;
                const mtlURL: string = `https://translate.yandex.net/api/v1/tr.json/translate?id=011f69ca.62da9350.9a02e657.74722d74657874-1-0&srv=tr-text&lang=${lang}-en&reason=auto&format=text&ajax=1&yu=4678998311658491538`;
                let form: URLSearchParams = new URLSearchParams();
                form.append('text', text);
                form.append('options', '4');
                axios.post(mtlURL, form).then(async (res) => {
                    if (res.status == 200) {
                        const result: string = res.data.text[0];
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
