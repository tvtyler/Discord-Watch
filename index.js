const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');

dotenv.config()

const client = new Client ({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const TARGET_USERNAME = 'tvtyler65'; // The username you want to listen to

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    // Check if the message author is the target user and the message is not from a bot
    if (message.author.username === TARGET_USERNAME && !message.author.bot) {
        // Respond by copying the message content
        message.channel.send(message.content);
    }
});

client.login(process.env.DISCORD_TOKEN);