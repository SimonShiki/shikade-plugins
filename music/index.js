"use strict";
const http = require("http");

let config = {};
let client = null;

async function onMessage (session) {
    if (!config.admins.includes(session.sender.user_id)) return;
    if (session.raw_message.startsWith("点歌")) {
        const word = session.raw_message.replace("点歌", "").trim();
        if (!word) return;
        http.get(`http://s.music.163.com/search/get/?type=1&s=${word}&limit=1`, res => {
            res.on("data", chunk => {
                try {
                    const id = JSON.parse(String(chunk))?.result?.songs?.[0]?.id;
                    if (id) {
                        if (session.group?.shareMusic) session.group.shareMusic("163", id);
                        if (session.friend?.shareMusic) session.friend.shareMusic("163", id);
                    } else session.reply("未找到歌曲：" + word);
                } catch (e) {
                    config.logger.error("请求歌曲API遇到错误：");
                    config.logger.error(e);
                }
            });
        }).on("error", (e)=>{
            config.logger.error(e);
        })
    }
}

const plugin = {
    name: '点歌插件',
    id: 'shiki.song',
    shortName: 'song',
    async init (initConfig) {
        config = initConfig;
    },
    async uninit () {},
    async enable (bot) {
        client = bot;
        bot.randomHashedMessage = true;
        bot.on('message', onMessage);
    },
    async disable (bot) {
        bot.off('message', onMessage);
    }
}

module.exports = plugin;