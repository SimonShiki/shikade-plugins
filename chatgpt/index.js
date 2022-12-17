"use strict";

let config = {};
let client = null;
let gpt = null;

async function onGroupMessage (session) {
    const localData = await client.loadLocalUserData();
    if (!localData.workgroup || !localData.workgroup.includes(session.group_id)) return;

    if (session.raw_message.startsWith('!gpt')) {
        const requestText = session.raw_message.slice(5);
        const response = await gpt.sendMessage(requestText);
        session.reply(response);
    }
}

const plugin = {
    name: 'ChatGPT',
    id: 'shiki.chatgpt',
    shortName: 'chatgpt',
    async init (initConfig) {
        config = initConfig;
    },
    async uninit () {},
    async enable (bot) {
        client = bot;
        bot.randomHashedMessage = true;
        
        if (!config.pluginData || !config.pluginData.hasOwnProperty('openai')) {
            await client.saveLocalUserData({
                openai: {
                    email: '',
                    password: ''
                }
            });
            config.logger.warn('OpenAI 账号尚未配置，请指定后重载本插件');
            return;
        }
        
        const { ChatGPTAPI, getOpenAIAuth } = await import('chatgpt');
        const openAIAuth = await getOpenAIAuth({
            email: config.pluginData.openai.email,
            password: config.pluginData.openai.password
        });
        gpt = new ChatGPTAPI({ ...openAIAuth, markdown: false });
        await gpt.ensureAuth();
        
        bot.on('message.group', onGroupMessage);
    },
    async disable (bot) {
        bot.off('message.group', onGroupMessage)
    }
}

module.exports = plugin
