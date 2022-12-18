"use strict";
const axios = require("axios");

let config = {};
let client = null;

async function sendWebhook (session) {
    const processedMessage = processMessage(session.message);
    await axios.post(config.discord_webhook,
        JSON.stringify({
            content: processedMessage,
            username: session.sender.nickname,
            avatar_url: session.member.getAvatarUrl(140)
        }), {
            headers: {
                'content-type': 'application/json'
            }
        }
    );
}

function processMessage (msgArray) {
    const result = [];
    for (const msgElem of msgArray) {
        switch (msgElem.type) {
        case 'face':
            result.push(` [${msgElem.text}] `);
            break;
        case 'at':
        case 'text':
            result.push(msgElem.text);
            break;
        case 'bface':
            result.push(` [表情${msgElem.file}] `);
            break;
        case 'share':
        case 'flash':
        case 'image':
            result.push(` ${msgElem.url} `);
            break;
        default: 
            result.push(`[${msgElem.type} msg]`);
        }
    }
    return result.join('');
}
    
async function onGroupMessage (session) {
    if (!config.workgroup.includes(session.group_id)) return;
    if (session.raw_message == '签到') return;
    await sendWebhook(session);
}

const plugin = {
    name: 'Discord 转发插件',
    id: 'frank.discord',
    shortName: 'discord-forwarding',
    async init (initConfig) {
        config = initConfig;
    },
    async uninit () {},
    async enable (bot) {
        client = bot;
        let localData = await client.loadLocalUserData();
        if (!localData || !localData.hasOwnProperty('discord_webhook')) {
            config.logger.info('尚未配置 discord 反代地址，请配置完后重载本插件');
            localData.discord_webhook = '';
            await client.saveLocalUserData(localData);
            return;
        }
        config.discord_webhook = localData.discord_webhook;
        bot.randomHashedMessage = true;
        bot.on('message.group', onGroupMessage);
    },
    async disable (bot) {
        bot.off('message.group', onGroupMessage);
    }
}

module.exports = plugin;