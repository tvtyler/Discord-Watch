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
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule a job to run every day at noon eastern
    schedule.scheduleJob('0 23 * * *', checkUserActivity);

    // debugging
    // schedule.scheduleJob('* * * * *', checkUserActivity);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    console.log(`voiceStateUpdate triggered for user: ${newState.member.id}`);
    
    // Listen for target to join a voice channel and update daysMissed accordingly.
    if (newState.member.id === TARGET_USER_ID) {
        console.log(`Target user detected.`);
        
        if (!oldState.channelId && newState.channelId) {
            console.log(`Target user has joined a voice channel.`);

            if (daysMissed > 0) {
                const channel = client.channels.cache.get(CHANNEL_ID);
                if (channel) {
                    channel.send(`<@${newState.member.id}> has decided you are worth his time. Maybe you'll be hardcore this time boys.`);
                } else {
                    console.log(`Channel with ID ${CHANNEL_ID} not found.`);
                }
            }
            daysMissed = 0;
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
            channel.send(`<@${targetUser.user.id}> is currently in a voice channel. No days missed. Cho would be proud.`);
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
