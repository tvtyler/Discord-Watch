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

const TARGET_USER_ID = '151778455300734976';
const CHANNEL_ID = '1239347161242669136';
let daysMissed = 0; 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule a job to run every day at 5 PM UTC
    schedule.scheduleJob('0 17 * * *', checkUserActivity);

    // debugging
    // schedule.scheduleJob('* * * * *', checkUserActivity);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    console.log(`voiceStateUpdate triggered for user: ${newState.member.id}`);
    
    // Listen for target to join a voice channel
    if (newState.member.id === TARGET_USER_ID) {
        console.log(`Target user detected in voiceStateUpdate.`);
        
        if (!oldState.channelId && newState.channelId) {
            console.log(`Target user has joined a voice channel.`);

            if (daysMissed > 0) {
                // Send a message to the channel when daysMissed resets to 0
                const channel = client.channels.cache.get(CHANNEL_ID);
                if (channel) {
                    channel.send(`<@${newState.member.id}> is testing bot.`);
                } else {
                    console.error(`Channel with ID ${CHANNEL_ID} not found.`);
                }
            }
            daysMissed = 0;
        }
    }
});

async function checkUserActivity() {
    try {
        const guild = client.guilds.cache.get('987760673197027377'); 
        if (!guild) {
            console.error(`Guild with ID '987760673197027377' not found.`);
            return;
        }

        const targetUser = await guild.members.fetch(TARGET_USER_ID);
        if (!targetUser) {
            console.error(`User with ID ${TARGET_USER_ID} not found.`);
            return;
        }

        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error(`Channel with ID ${CHANNEL_ID} not found.`);
            return;
        }

        // Check if the user is in a voice channel
        if (targetUser.voice.channelId) {
            channel.send(`<@${targetUser.user.id}> is currently in a voice channel. No days missed. Cho would be proud.`);
        } else {
            daysMissed++;
            channel.send(`<@${targetUser.user.id}> hasn't gamed with the homies for ${daysMissed} day(s). :(`);
        }
    } catch (error) {
        console.error('Error checking user activity:', error);
    }
}

client.login(process.env.DISCORD_TOKEN);
