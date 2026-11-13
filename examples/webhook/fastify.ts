import { fastify } from "fastify";
import { Telegraf } from "telegraf";
import type { Update } from "telegraf/types";

const bot = new Telegraf(token);
const app = fastify();

const webhook = await bot.createWebhook({ domain: webhookDomain });

app.post<{ Body: Update }>(
	`/telegraf/${bot.secretPathComponent()}`,
	async (request, reply) => {
		// Fastify owns parsing; Telegraf needs the raw Node request/response.
		reply.hijack();
		await webhook(
			Object.assign(request.raw, { body: request.body }),
			reply.raw,
		);
	},
);

bot.on("text", ctx => ctx.reply("Hello"));

app.listen({ port: port }).then(() => console.log("Listening on port", port));
