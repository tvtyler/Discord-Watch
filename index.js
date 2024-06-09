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

const TARGET_USER_ID = '694018105701171210';
const CHANNEL_ID = '987760674312704032';
let daysMissed = 0; 
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule a job to run every day at 3 AM UTC (10 PM Eastern Time during standard time)
    schedule.scheduleJob('* * * * *', checkUserActivity);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // Check if the target user has joined a voice channel
    if (newState.id === TARGET_USER_ID && newState.channelId) {
        if (daysMissed > 0) {
            // Send a message to the channel when daysMissed resets to 0
            const channel = client.channels.cache.get(CHANNEL_ID);
            channel.send(`${newState.member.user.username} is gaming with the homies. The counter has reset to 0 days.`);
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
        channel.send(`${targetUser.user.username} is currently in a voice channel. No days missed. Cho would be proud.`);
    } else {
        daysMissed++;
        const channel = client.channels.cache.get(CHANNEL_ID);
        channel.send(`${targetUser.user.username} has not joined a voice channel for ${daysMissed} day(s).`);
    }
}

client.login(process.env.DISCORD_TOKEN);
