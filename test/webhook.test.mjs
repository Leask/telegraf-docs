import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import test from 'node:test';
import vm from 'node:vm';
import fastify from 'fastify';
import Koa from 'koa';
import { bodyParser } from '@koa/bodyparser';

// Run the compiled examples with real HTTP frameworks, without a Telegram
// credential, a public listener, or setWebhook/getMe network requests.
async function loadExample(name) {
    const received = [];
    let app;
    class Bot {
        on() { return this; }
        command() { return this; }
        secretPathComponent() { return 'test-secret'; }
        async createWebhook() {
            return async (request, response) => {
                received.push(request.body);
                response.setHeader('content-type', 'application/json');
                response.end(JSON.stringify({ ok: true }));
            };
        }
    }
    const context = vm.createContext({
        token: 'test-only', webhookDomain: 'example.invalid', port: 0,
        console: { log() {} },
    });
    function makeFastify() {
        app = fastify();
        app.listen = async () => app;
        return app;
    }
    class TestKoa extends Koa {
        constructor(...args) {
            super(...args);
            app = this;
        }
        listen() { return this; }
    }
    const modules = {
        telegraf: { Telegraf: Bot },
        fastify: { fastify: makeFastify },
        koa: { default: TestKoa },
        '@koa/bodyparser': { bodyParser },
    };
    const file = new URL(`../dist-examples/webhook/${name}.js`, import.meta.url);
    const source = new vm.SourceTextModule(await readFile(file, 'utf8'), {
        context,
    });
    await source.link((specifier) => {
        const exports = modules[specifier];
        assert.ok(exports, `Unexpected example dependency: ${specifier}`);
        return new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [key, value] of Object.entries(exports)) {
                this.setExport(key, value);
            }
        }, { context });
    });
    await source.evaluate();
    return { app, received };
}

for (const name of ['fastify', 'koa']) {
    test(`${name} forwards the parsed JSON update to the raw webhook`,
        async (t) => {
            const { app, received } = await loadExample(name);
            const payload = { update_id: 123, message: { text: 'hello' } };
            let request;
            if (name === 'fastify') {
                t.after(() => app.close());
                request = (body) => app.inject({
                    method: 'POST', url: '/telegraf/test-secret',
                    headers: { 'content-type': 'application/json' },
                    payload: JSON.stringify(body),
                });
            } else {
                const server = http.createServer(app.callback());
                await new Promise((resolve) => server.listen(0, '127.0.0.1',
                    resolve));
                t.after(() => new Promise((resolve) => server.close(resolve)));
                request = async (body) => {
                    const response = await fetch(
                        `http://127.0.0.1:${server.address().port}/telegraf/test-secret`,
                        { method: 'POST', headers: {
                            'content-type': 'application/json',
                        }, body: JSON.stringify(body) },
                    );
                    return { statusCode: response.status,
                        body: await response.text() };
                };
            }
            const success = await request(payload);
            assert.equal(success.statusCode, 200);
            assert.deepEqual(JSON.parse(success.body), { ok: true });
            assert.deepEqual(received, [payload]);
            const oversized = await request({ data: 'x'.repeat(1024 * 1024) });
            assert.equal(oversized.statusCode, 413);
            assert.equal(received.length, 1);
        });
}
