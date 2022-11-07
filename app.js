const env = require("./env.json");
const puppeteer = require("puppeteer");
const { Client, GatewayIntentBits, EmbedBuilder, Embed, Attachment } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let prefix = "!";
let CHANNELID = "1025105878346629140";
let gtURL = "gametrackerserverurl";

let page;
client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift();

    if (cmd === "players") {

        const playerList = await page.$$eval("#HTML_online_players .table_lst.table_lst_stp tbody tr :nth-child(2)", t => { return t.map(t => t.innerText) });
        playerList.shift();

        let r = "";
        for (let i = 0; i < playerList.length; i++)
            r += `${playerList[i]}\n`;

        msg.author.send(`**Online Players:**\n\n${r}`);
        msg.reply("I sent the list of **Online Players** to you, watch yor DM box.");
    } else if (cmd === "server" || cmd === "ip") {

        const img = await page.$eval(".item_560x95", t => t.src);
        let serverIp = await page.$eval(".blocknewheadercnt", t => t.innerText);
        serverIp = serverIp.slice(1, serverIp.search(" -"));
        msg.channel.send(img + `\nQuick Join: **steam://connect/${serverIp}**`);

    } else if (cmd === "test") {
        /* Get Data */
        const serverName = await page.$eval(".block630_content_left a b", t => t.innerText);
        let serverIp = await page.$eval(".blocknewheadercnt", t => t.innerText);
        serverIp = serverIp.slice(1, serverIp.search(" -"));
        const currentPlayers = await page.$eval("#HTML_num_players", t => t.innerText);
        const maxPlayers = await page.$eval("#HTML_max_players", t => t.innerText);
        const currentMap = await page.$eval("#HTML_curr_map", t => t.innerText);
        const img = await page.$eval(".block630_content_right .item_160x120", t => t.src);

        /* Build Embed */
        const embed = new EmbedBuilder();
        embed.setColor("#FF0000");
        embed.setTitle(serverName);
        embed.setDescription(`Current Map: **${currentMap}**\nOnline Players: **${currentPlayers}/${maxPlayers}**\nQuick Join: **steam://connect/${serverIp}**\n\n`);
        embed.setThumbnail(img);
        embed.setTimestamp();
        embed.setFooter({ text: client.user.tag });
        client.channels.cache.get(CHANNELID).send({ embeds: [embed] });
    }
})

client.on("ready", async () => {
    console.log(`Logged in as @${client.user.tag}`);

    const browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(gtURL);
    const currentMap = await page.$eval("#HTML_curr_map", t => t.innerText);
    setInterval(async () => {
        if (currentMap !== await page.$eval("#HTML_curr_map", t => t.innerText)) {
            // Execution context was destroyed, most likely because of a navigation.
            await page.waitForNavigation();

            /* Get Data */
            const serverName = await page.$eval(".block630_content_left a b", t => t.innerText);
            let serverIp = await page.$eval(".blocknewheadercnt", t => t.innerText);
            serverIp = serverIp.slice(1, serverIp.search(" -"));
            const currentPlayers = await page.$eval("#HTML_num_players", t => t.innerText);
            const maxPlayers = await page.$eval("#HTML_max_players", t => t.innerText);
            const currentMap = await page.$eval("#HTML_curr_map", t => t.innerText);
            const img = await page.$eval(".block630_content_right .item_160x120", t => t.src);

            /* Build Embed */
            const embed = new EmbedBuilder();
            embed.setColor("#FF0000");
            embed.setTitle(serverName);
            embed.setDescription(`Current Map: **${currentMap}**\nOnline Players: **${currentPlayers}/${maxPlayers}**\nQuick Join: **steam://connect/${serverIp}**\n\n`);
            embed.setThumbnail(img);
            embed.setTimestamp();
            embed.setFooter({ text: client.user.tag });
            client.channels.cache.get(CHANNELID).send({ embeds: [embed] });
        }
    }, 1000);
});

client.login(env.token);
