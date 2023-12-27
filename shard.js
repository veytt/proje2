const { ShardingManager, WebhookClient, EmbedBuilder , ShardingManager } = require('discord.js');
const chalk = new require('chalk');
const { token, shard: totalShards, webhook: url } = require("./config.json");
const kullanıcıAdı = "NTRP bot";
let wb;Developed

if (url) {
    try {
        wb = new WebhookClient({ url });
    } catch (e) {
        console.error('Webhook oluşturulamadı:', e);
    }
}

const manager = new ShardingManager('bot.js', { token, respawn: true, totalShards });

manager.on('shardCreate', shard => {
    console.log(chalk.green(`[SHARD SYSTEM] `) + chalk.red(`#${shard.id} ID'li shard başarıyla başlatıldı`));
    if (wb) {
        shard.on("disconnect", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:offline:1187771693167562802> \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] });
        });
        shard.on("reconnecting", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:online:1187771693167562802> \`#${shard.id}\` - ID'li shard yeniden başlatılıyor**`).setColor("Green")] });
        });
        shard.on("ready", async () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:bosta:1187771693167562802> \`#${shard.id}\` - ID'li shard başarıyla başlatıldı**`).setColor("Yellow")] });
        });
        shard.on("death", () => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**<:offline:1187771693167562802> \`#${shard.id}\` - ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] });
        });
        shard.on("error", (err) => {
            wb.send({ embeds: [new EmbedBuilder().setDescription(`**‼️ \`#${shard.id}\` - ID'li shard'a bir hata oluştu\n\n• ${err}**`).setColor("Red")] });
        });
    }
});

manager.spawn().then(() => {
    if (wb) wb.send({ embeds: [new EmbedBuilder().setDescription(`**Bütün shard'lar başarıyla başlatıldı ve kullanıma hazır**`).setColor("DarkPurple")] });
    console.log(chalk.green(`[SHARD SYSTEM] `) + chalk.red(`Bot Aktif Edildi !`));
});
