import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const { BOT_TOKEN, HTTPS_PROXY } = process.env;

if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');
if (!HTTPS_PROXY) throw new Error('"HTTPS_PROXY" env var is required!');

const agent = new HttpsProxyAgent(HTTPS_PROXY);

const fetchWithProxy = (url: URL | string, init?: RequestInit) =>
	fetch(
		String(url),
		{ ...init, agent } as unknown as Parameters<typeof fetch>[1],
	);

const bot = new Telegraf(BOT_TOKEN, {
	telegram: { fetch: fetchWithProxy },
});

// The custom fetch is used for Bot API calls and URL attachments.

bot.start(ctx => ctx.reply("Hello"));
bot.help(ctx => ctx.reply("Help message"));
bot.command("photo", ctx =>
	ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" }),
);

bot.launch();
