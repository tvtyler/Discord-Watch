const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const TARGET_USER_ID = '151778455300734976';
const CHANNEL_ID = '1239347161242669136';
let daysMissed = 0; 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule a job to run every day at 5 PM UTC (equivalent to noon Eastern Time during standard time)
    schedule.scheduleJob('0 17 * * *', checkUserActivity);

    // debugging
    // schedule.scheduleJob('* * * * *', checkUserActivity);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if the target user has joined a voice channel
    if (newState.member.id === TARGET_USER_ID && oldState.channelId === null && newState.channelId !== null) {
        if (daysMissed > 0) {
            // Send a message to the channel when daysMissed resets to 0
            const channel = client.channels.cache.get(CHANNEL_ID);
            channel.send(`<@${newState.member.id}> is testing the bot.`);
        }
        daysMissed = 0;
    }
});

function checkUserActivity() {

    const guild = client.guilds.cache.get('987760673197027377'); 
    const targetUser = guild.members.cache.get(TARGET_USER_ID);

    // Check if the user is in a voice channel
    if (targetUser.voice.channelId) {
        const channel = client.channels.cache.get(CHANNEL_ID);
        channel.send(`<@${targetUser.user.id}> is currently in a voice channel. No days missed. Cho would be proud.`);
    } else {
        daysMissed++;
        const channel = client.channels.cache.get(CHANNEL_ID);
        channel.send(`<@${targetUser.user.id}> hasn't gamed with the homies for ${daysMissed} day(s). :(`);
    }
}

client.login(process.env.DISCORD_TOKEN);
