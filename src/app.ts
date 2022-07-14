import { Client, Collection, Intents } from 'discord.js';
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
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPW}@noconnection.dpmpa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
});
const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands: Collection<string, Command> = new Collection;
const commandsToPush: SlashCommandBuilder[] = [];
const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
const guildID: string[] = [
    //'992115669774635078',
    '870268766137753602'
];
const clientID = '996034025842036816';

client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
    console.log("MONGODB READY");
});

for (const file of commandFiles) {
    if (file.includes("template")) {
        continue;
    }
    const command = import(`./commands/${file}`);
    console.info(`CMD: ${command} - File: ${file}`);
    command.then(val => {
        console.log(`CMD: ${command} - File: ${file}`);
        console.log("Command data:");
        console.log(val.data);
        if (val != undefined && val.data != undefined && val.data.command != undefined) {
            commands.set(val.data.command.name, val.data);
            commandsToPush.push(val.data.command);
        }
    }).finally(() => {
        const rest = new REST({ version: '9' }).setToken(process.env.BOTTOKEN == undefined ? "" : process.env.BOTTOKEN);
        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                commandsToPush.forEach(console.log);

                await rest.put(
                    Routes.applicationCommands(clientID),
                    { body: commandsToPush.map(val => val.toJSON()) },
                )
                    .finally(() => console.log('Refreshing completed.'))
                    .catch(console.error);

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    });
}

bot.once('ready', () => {
    console.log("BOT READY");
});

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
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
