const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const TARGET_USER_ID = '694018105701171210';
const CHANNEL_ID = '1239347161242669136';
let daysMissed = 0; 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Schedule a job to run every day at noon eastern
    schedule.scheduleJob('0 24 * * *', checkUserActivity);

    // debugging
    // schedule.scheduleJob('* * * * *', checkUserActivity);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    console.log(`voiceStateUpdate triggered for user: ${newState.member.id}`);
    
    // Listen for target to join a voice channel and update daysMissed accordingly.
    if (newState.member.id === TARGET_USER_ID) {
        
        if (!oldState.channelId && newState.channelId) {
            const voiceChannel = client.channels.cache.get(newState.channelId);
            const textChannel = client.channels.cache.get(CHANNEL_ID);

            if (voiceChannel && voiceChannel.members.size > 1) {
                textChannel.send(`<@${newState.member.id}> has decided you are worth his time. Maybe you'll beat hardcore this time lads.`);
                daysMissed = 0;
            } else {
                textChannel.send(`<@${newState.member.id}> has joined a voice channel alone.`);
            }
        }
    } else {
        // Listen for anyone else joining the target user's channel
        const targetUser = oldState.guild.members.cache.get(TARGET_USER_ID);
        const voiceChannel = targetUser ? client.channels.cache.get(targetUser.voice.channelId) : null;
        const textChannel = client.channels.cache.get(CHANNEL_ID);

        if (voiceChannel && targetUser && targetUser.voice.channelId === newState.channelId && newState.channelId !== null) {
            if (voiceChannel.members.size == 2) {
                textChannel.send(`<@${newState.member.id}> has joined <@${TARGET_USER_ID}>'s channel. Days missed has been reset.`);
                daysMissed = 0;
            }
        }
    }
});


async function checkUserActivity() {
    try {
        const guild = client.guilds.cache.get('987760673197027377'); 
        const targetUser = await guild.members.fetch(TARGET_USER_ID);
        const channel = client.channels.cache.get(CHANNEL_ID);

        // Check if the user is in a voice channel
        if (targetUser.voice.channelId) {
            channel.send(`<@${targetUser.user.id}> is currently in a voice channel. Cho would be proud.`);
        } else {
            daysMissed++;
            channel.send(`<@${targetUser.user.id}> hasn't gamed with the homies for ${daysMissed} day(s). :(`);
        }
    } catch (error) {
        console.error('Error checking user activity:', error);
        console.log("Error:", error);
    }
}

client.login(process.env.DISCORD_TOKEN);
