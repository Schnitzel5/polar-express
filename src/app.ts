import { Client, Collection, GuildMember, Intents } from 'discord.js';
import * as dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import * as fs from 'node:fs';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Command } from './commands/template';
import express from 'express';

let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPW}@${process.env.MONGOURL}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
});
const bot: Client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
const commands: Collection<string, Command> = new Collection;
const commandsToPush: SlashCommandBuilder[] = [];
const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
const guildID: string = '992115669774635078';
const clientID = '996034025842036816';
const members: GuildMember[] = [];

let count = 0;
const rest = new REST({ version: '9' }).setToken(process.env.BOTTOKEN == undefined ? "" : process.env.BOTTOKEN);
console.log('Started refreshing application (/) commands.');
for (let file of commandFiles) {
    count++;
    console.log("CMDs: " + commandsToPush.length + " Count: " + count);
    if (file.includes("template.ts")) {
        continue;
    }
    const command = import(`./commands/${file}`);
    console.info(`CMD: ${command} - File: ${file}`);
    command.then(val => {
        console.log(`CMD: ${command} - File: ${file}`);
        console.log("Command data:");
        if (val != undefined && val.data != undefined && val.data.command != undefined) {
            console.log("CMD NAME: " + val.data.command.name);
            commands.set(val.data.command.name, val.data);
            commandsToPush.push(val.data.command);
        }
    }).finally(() => {
        if (count == commandFiles.length) {
            (async () => {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(clientID, guildID),
                        { body: commandsToPush.map(val => val.toJSON()) },
                    )
                        .finally(() => {
                            console.log(commandsToPush.map(val => val.name));
                            console.log('Successfully reloaded application (/) commands.');
                            //console.log("JSON");
                            //console.log(commandsToPush.map(val => val.toJSON()));
                        })
                        .catch(console.error);
                    /*await rest.put(Routes.applicationCommands(clientID), { body: [] })
                        .finally(() => console.log("Global commands cleared."));*/
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    });
}

bot.once('ready', async () => {
    console.log("BOT READY");
    const guild = bot.guilds.cache.get('992115669774635078');
    console.log(`Guild: ${guild}`);
    await guild?.members?.fetch({ force: true }).then((val) => {
        val.forEach(member => members.push(member));
        console.log("Members fetched!");
    }).catch(err => console.log(`Failed to fetch members: ${err}`));
});

bot.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'setboard' || interaction.commandName === 'board') {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'board' || focusedOption.name === 'name') {
                connectMongo(client, () => {
                    const boards = client.db('PolarExpressTM').collection("boards");
                    boards.find({}).project({ 'Board': 1 }).toArray(async (err, data) => {
                        if (err) {
                            console.error("Leaderboard fetch failed: " + err.message);
                        }
                        try {
                            let choices: string[] = [];
                            if (data != undefined) {
                                choices = [...new Set<string>(data.map(doc => doc.Board))];
                            }
                            const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
                            await interaction.respond(
                                filtered.map(choice => ({ name: choice, value: choice })),
                            );
                        } catch (err) {
                            console.error(`Error responding slash command: ${err}`);
                        }
                    });
                });
            }
        }
        return;
    }
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

bot.login(process.env.BOTTOKEN);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Nothing here to see!' });
});

app.listen(parseInt(process.env.PORT == undefined ? '8080' : process.env.PORT) || 8080, '0.0.0.0', () => {
    console.log("API Server is running.");
});

export function connectMongo(client: MongoClient, callback: () => void) {
    /*client = new MongoClient(uri, {
        serverApi: ServerApiVersion.v1
    });*/
    client.connect((err) => {
        if (err) {
            console.error(`Connection failed: ${err.message}`);
            return;
        }
        callback();
    });
}

export const guildId: string = '992115669774635078';
export const discordClient: Client = bot;
export const guildMembers: GuildMember[] = members;