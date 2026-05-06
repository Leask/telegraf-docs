import { fastify } from "fastify";
import { Telegraf } from "telegraf";
import type { Update } from "telegraf/types";

const bot = new Telegraf(token);
const app = fastify();

const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
await bot.createWebhook({ domain: webhookDomain, path: webhookPath });

app.post(webhookPath, async (request, reply) => {
	await bot.handleUpdate(request.body as Update);
	return reply.code(200).send();
});

bot.on("text", ctx => ctx.reply("Hello"));

app.listen({ port: port }).then(() => console.log("Listening on port", port));
