import { EmbedBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, CacheType } from "discord.js";
import build, { Command } from "./template";
import * as cheerio from 'cheerio';
import axios from "axios";
import FormData from 'form-data';

export const data: Command = {
    command: build('sauce', 'Give sauce!', [
        { name: 'url', description: 'URL of the desired image', type: "String", required: true }
    ]),
    execute: async (interaction: BaseCommandInteraction<CacheType>) => {
        const sauceURL: string = 'https://saucenao.com/search.php';
        let form: FormData = new FormData();
        let options: any = interaction.options;
        let url: string = options.getString('url');
        let embed: EmbedBuilder = new EmbedBuilder();
        embed.setColor([255, 67, 63]);
        embed.setTitle('Sauce is here!');
        embed.setAuthor({
            name: 'The Polar Express™',
            iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100',
            url: 'https://polarexpress-beta.web.app/welcome'
        });
        form.append('file', '(binary)');
        form.append('url', url);
        axios.post(sauceURL, form, { headers: form.getHeaders() })
            .then(async (res) => {
                console.log('DEBUG');
                if (res.status == 200) {
                    console.log('Status 200');
                    const $ = cheerio.load(res.data);
                    console.log("TESTING res.data");
                    console.log(res.data);
                    let count = 0;
                    $('.resulttable').each((index, element) => {
                        let resultLinks = $('.resultcontentcolumn', element).first();
                        console.log('ELEMENT');
                        console.log(element);
                        $('a', resultLinks).each((i, e) => {
                            if (count > 24) {
                                return;
                            }
                            console.log('E');
                            console.log(e);
                            let linkText = $(e).text();
                            let link = $(e).attr('href');
                            if (link == undefined) {
                                return;
                            }
                            embed.addFields({
                                name: `${(i == 0 ? 'ID: ' : 'Author: ')} ${linkText}`,
                                value: link,
                                inline: false
                            });
                            count++;
                        });
                    });
                }
                embed.setFooter({
                    text: 'Fun Fact: Polar bear meat is yummy!',
                    iconURL: 'https://cdn.discordapp.com/avatars/996034025842036816/8f53fdf39c01cbb3474ed0eb0cd094a2.webp?size=100'
                });
                await interaction.reply({ embeds: [embed.toJSON()] });
            }).catch((err) => {
                console.error(err);
            });
    }
}