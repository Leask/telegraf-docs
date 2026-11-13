import { Telegraf } from "telegraf";
import type { Update } from "telegraf/types";
import Koa from "koa";
import { bodyParser } from "@koa/bodyparser";

const bot = new Telegraf(token);
const app = new Koa();

// First reply will be served via webhook response,
// but messages order not guaranteed due to `koa` pipeline design.
// Details: https://github.com/telegraf/telegraf/issues/294
bot.command("image", ctx =>
	ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" }),
);
bot.on("text", ctx => ctx.reply("Hello"));

// Telegram sends JSON updates, not multipart form uploads.
app.use(bodyParser({ enableTypes: ["json"], patchNode: true }));

const webhook = await bot.createWebhook({ domain: webhookDomain });

app.use(async (ctx, next) => {
	if (ctx.method !== "POST" || ctx.path !== `/telegraf/${bot.secretPathComponent()}`) {
		return next();
	}
	// Telegraf writes the raw response; do not let Koa replace it with a 404.
	ctx.status = 200;
	ctx.respond = false;
	await webhook(
		Object.assign(ctx.req, { body: ctx.request.body as Update }),
		ctx.res,
	);
});

app.listen(port, () => console.log("Listening on port", port));
