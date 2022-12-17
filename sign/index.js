"use strict";

let config = {};
let client = null;
async function onGroupMessage (session) {
    let localData = await client.loadLocalUserData();
    if (!localData.workgroup || !localData.workgroup.includes(session.group_id)) return;
    
    const today = new Date().getDay();
    if (localData.lastUpdatedDay !== today) {
        localData = {
            workgroup: localData.workgroup || [],
            lastUpdatedDay: today,
            seed: Math.round(Math.random() * 100 + 1),
            signedUser: {}
        }
        await client.saveLocalUserData(localData);
    }
    
    if (session.raw_message.trim() === '签到') {
        const attempt = localData.signedUser[session.user_id];
        if (attempt <= 0) {
            const jrrp = parseInt(session.user_id / localData.seed % 101);
            session.reply('签到成功(≧▽≦)！你今天的人品是：'+ jrrp);
        } else if (attempt == 1) {
            const jrrp = parseInt(session.user_id / localData.seed % 101);
            session.reply('你知道吗，反复签到可是要掉脑袋的(๑•﹏•) 你今天的人品是：' + jrrp);
        } else {
            try {
                client.setGroupBan(session.group_id, session.user_id, attempt ** attempt * 60);
            } catch (e) {}
        }
        
        localData.signedUser[session.user_id] += 1;
        await client.saveLocalUserData(localData);
    }
}

const plugin = {
    name: '签到插件',
    id: 'shiki.sign',
    shortName: 'sign',
    async init (initConfig) {
        config = initConfig;
    },
    async uninit () {},
    async enable (bot) {
        client = bot;
        bot.randomHashedMessage = true;
        bot.on('message.group', onGroupMessage)
    },
    async disable (bot) {
        bot.off('message.group', onGroupMessage)
    }
}

module.exports = plugin