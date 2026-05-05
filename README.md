# Telegraf docs

This repo will house the future of Telegraf's documentation. For now, it houses bot examples.

### [![New](https://img.shields.io/badge/new%20✨-8A2BE2?style=flat-square) Build Telegram Mini Apps with Telegraf](./examples/mini-apps/README.md)

## How to use these examples:

In the interest of brevity, the examples in the repo don't explain certain good-to-haves.

### Graceful stop

On NodeJS, to make sure connections are gracefully closed before process is killed, you can use the `process.once` hooks. This is safe to add to the end of your bot's entry file.

```TS
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

### Secrets

This section talks about how to pass variables like token, port, webhook domain to the bot.

The recommendation is to pass them via environment variables and not directly include them in code. This is especially true for sensitive secrets such as token. This should probably be added before calling `new Telegraf()`.

```TS
// default to port 3000 if PORT is not set
const port = Number(process.env.PORT) || 3000;

// assert and refuse to start bot if token or webhookDomain is not passed
if (!process.env.BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');
if (!process.env.WEBHOOK_DOMAIN) throw new Error('"WEBHOOK_DOMAIN" env var is required!');
```

> **Important note**: Only use the vars needed for your bot. If you don't use webhooks, you don't need WEBHOOK_DOMAIN or the corresponding assertion.

Different deployment methods may have their own ways to pass environment variables. If you deploy to a Function-as-a-Service host such as Heroku, Netlify, AWS Lambda, GCP Functions, use the platform-specific way to set the correct environment variables.

If you use a conventional server, you can use the npm package `"dotenv"` to load vars from an `.env` file. Place this file in root and <u><b>DO NOT FORGET</b></u> to add this file to `.gitignore` (or you may leak credentials on the internet):

```yaml
# .env
PORT=3000
WEBHOOK_DOMAIN=bot.example.com
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### Runtime networking and proxies

Telegraf v6 uses the Node.js native `globalThis.fetch` implementation by default. It no longer exposes the old `telegram.agent` or `telegram.attachmentAgent` options.

If your bot needs a proxy, custom TLS handling, custom compression, or another non-standard network path, install the fetch and agent packages you need and inject that behavior with `telegram.fetch`. The custom fetch is used for both Bot API calls and URL attachments. See [`examples/proxy-bot.ts`](./examples/proxy-bot.ts) for a proxy example.
