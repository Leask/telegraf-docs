# Telegraf on AWS Lambda

This template demonstrates how to run a simple Telegraf echo bot with on AWS Lambda and API Gateway using the Serverless Framework.

## Usage

This example uses Serverless Framework 4 and the Node.js 22 Lambda runtime.
Framework 4 builds TypeScript and loads `.env` files without the old plugins.
It requires a Serverless account or license key, as described in the
[official upgrade guide](https://www.serverless.com/framework/docs/guides/upgrading-v4).
Authenticate before deploying; an AWS deployment is not part of the local
type-check or security audit. The framework version is pinned in both the
manifest and configuration to avoid implicit framework upgrades.

After installing dependencies (using `npm install` or the similar), the following commands are available:

```shell
npm run serverless # alias for the serverless binary
npm run release
npm run purge
npm run set-webhook
```

Copy `.env.example` to `.env` and replace the `BOT_TOKEN` with the one you've received from the Telegram Botfather.

After running `npm run release` your code is deployed at AWS and you should be able to see it in the console.

The next step is to tell the [Telegram Bot API your endpoint](https://core.telegram.org/bots/api#setwebhook).
To use the Telegraf helper function, you must copy the full URL from the deployment step and run:

```shell
npm run set-webhook -- -t $BOT_TOKEN -D '{ "url": $FULL_URL_TO_FUNCTION }'
```

(an alternative method to set the webhook using cURL can be found [here](https://github.com/serverless/examples/tree/v3/aws-node-telegram-echo-bot))

If you publish to AWS Lambda with a CI, you can run this npm script from your CI instead.

For more details, consult the [serverless framework documentation](https://www.serverless.com).
