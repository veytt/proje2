const { Client, GatewayIntentBits, PermissionFlagsBits, Events, Collection, EmbedBuilder , Intents , guilds } = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');
const INTENTS = Object.values(GatewayIntentBits);
const client = new Client({ intents: INTENTS });
const config = require("./config.json");
const chalk = require('chalk');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { readdirSync } = require("fs");
const moment = require("moment");
const db = require("croxydb")

let token = config.token;

client.commands = new Collection();
client.slashcommands = new Collection();
client.commandaliases = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

const slashcommands = [];
const commandFolders = fs.readdirSync('./commands');

console.log(chalk.red('[COMMANDS] Loading Commands...'));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const commandPath = `./commands/${folder}/${file}`;
        const command = require(commandPath);
        const commandCategory = folder.toLocaleUpperCase(); // Kategori adını küçük harfe çevirerek alıyoruz
        slashcommands.push(command.data.toJSON());
        client.slashcommands.set(command.data.name, command);
        console.log(chalk.cyan('[COMMANDS] ' + command.data.name + ' Yüklendi' + chalk.yellow(' - ') + chalk.red('Kategori: ' + commandCategory)));
    }
}

client.on(Events.ClientReady, async () => {
    try {
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: slashcommands,
        });
    } catch (error) {
        console.error(error);
    }
    console.log(chalk.red(`[START]`) + chalk.green(` ${client.user.username} 🤖 Aktif Edildi!`));
});


readdirSync("./events").forEach(async (file) => {
    const event = await require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

client.login(config.token);


//--------Küfür Engel--------//
const bannedWords = fs.readFileSync('kufur-liste.txt', 'utf8').split('\n').map(word => word.trim());
client.on("messageCreate", (message) => {
    let kufur = db.fetch(`kufurengel_${message.guild.id}`)
    if (!kufur) return;

    if (kufur) {
        if (message.author.bot) return;
        if (message.channel.type == "dm") return
        const content = message.content.toLowerCase();

        for (const bannedWord of bannedWords) {
            if (content.includes(bannedWord)) {
                if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return
                message.delete();
                message.channel.send(`${message.author}, bu sunucuda küfür etmemelisin dostum.`).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 3000);
                });
                return;
            }
        }
    }
})

//--------Reklam Engel--------//
const bannedLinks = fs.readFileSync('domain-liste.txt', 'utf8').split('\n').map(word => word.trim());
client.on("messageCreate", (message) => {
    let kufur = db.fetch(`reklamengel_${message.guild.id}`)
    if (!kufur) return;

    if (kufur) {
        if (message.author.bot) return;
        if (message.channel.type == "dm") return
        const content = message.content.toLowerCase();

        for (const bannedWord of bannedLinks) {
            if (content.includes(bannedWord)) {
                if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return
                message.delete();
                message.channel.send(`${message.author}, bu sunucuda reklam atamazsın!`).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 2000);
                });
                return;
            }
        }
    }
})


const { joinVoiceChannel } = require('@discordjs/voice');
 client.on('ready', () => { 
  joinVoiceChannel({
channelId: "1187768883789185144",
guildId: "1141050779919188169",
adapterCreator: global.client.guilds.cache.get("1141050779919188169").voiceAdapterCreator
    });
});
