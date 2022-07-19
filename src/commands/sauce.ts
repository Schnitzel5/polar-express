import { EmbedBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CacheType } from "discord.js";
import build, { Command } from "./template";
import * as cheerio from 'cheerio';
import axios from "axios";
import FormData from 'form-data';
import { MongoClient } from "mongodb";

const urlRegex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const data: Command = {
    command: build('sauce', 'Give sauce!', [
        { name: 'url', description: 'URL of the desired image', type: "String", required: true, autoComplete: false }
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>, client: MongoClient) => {
        const sauceURL: string = 'https://saucenao.com/search.php';
        let options: any = interaction.options;
        let url: string = options.getString('url');
        let form: FormData = new FormData();
        form.append('file', '(binary)');
        form.append('url', url);
        let embeds: EmbedBuilder[] = [];
        await interaction.reply('...');
        axios.post(sauceURL, form, { headers: form.getHeaders() })
            .then(async (res) => {
                if (res.status == 200) {
                    const $ = cheerio.load(res.data);
                    let count = 0;
                    $('.resulttable').each((index, element) => {
                        if (count >= 3) {
                            return;
                        }
                        let embed: EmbedBuilder = new EmbedBuilder();
                        embed.setColor([255, 67, 63]);
                        let resultTitle = $('.resulttitle', element).first().text();
                        let percentage = $('.resultsimilarityinfo', element).first().text();
                        embed.setTitle(`${resultTitle} - Similarity: ${percentage}`);
                        let resultImageElement = $('.resultimage', element).first();
                        let resultImage = $('img', resultImageElement).first().attr('src');
                        let resultImageFallback = $('img', resultImageElement).first().attr('data-src');
                        console.log("preview thumb " + resultImage + " count: " + count);
                        if (resultImage != undefined && resultImage.match(urlRegex)) {
                            embed.setThumbnail(resultImage);
                        } else if (resultImageFallback != undefined && resultImageFallback.match(urlRegex)) {
                            embed.setThumbnail(resultImageFallback);
                        } else {
                            embed.setThumbnail('https://gifimage.net/wp-content/uploads/2017/09/404-gif-4.gif');
                        }
                        let subtitle: string | undefined = undefined;
                        let source: string | undefined = undefined;
                        let sourceLink: string | undefined = undefined;
                        $('.resultcontentcolumn', element).first().children().each((i, e) => {
                            if (subtitle != undefined && source != undefined && sourceLink != undefined) {
                                embed.addFields({
                                    name: `${subtitle}`,
                                    value: `[${source}](${sourceLink.trim()} '${source}')`,
                                    inline: false
                                });
                                subtitle = undefined;
                                source = undefined;
                                sourceLink = undefined;
                            }
                            let tag: string = e.tagName;
                            if (tag === 'strong') {
                                subtitle = $(e).text();
                            }
                            if (tag === 'a') {
                                source = $(e).text();
                                sourceLink = $(e).attr('href');
                            }
                        });
                        embed.setFooter({
                            text: 'Fun Fact: Polar bear meat is yummy!',
                            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100'
                        });
                        embeds.push(embed);
                        count++;
                    });
                }
                await interaction.editReply({ embeds: embeds.map(e => e.toJSON()) });
            }).catch((err) => {
                console.error(err);
            });
    }
}