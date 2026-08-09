import { createServer as createHttpServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createGearDatabase } from './gearDatabase.mjs';
import { handleGearApi } from './gearApi.mjs';

const host = 'localhost';
const port = 58514;
const dataDirectory = join(process.cwd(), '.local-data');

mkdirSync(dataDirectory, { recursive: true });

const database = createGearDatabase(join(dataDirectory, 'gear.sqlite'));
const vite = await createViteServer({
  appType: 'spa',
  server: { middlewareMode: true },
});

const server = createHttpServer((request, response) => {
  void (async () => {
    if (await handleGearApi(request, response, database)) return;

    vite.middlewares(request, response, error => {
      if (!error) return;
      console.error('页面服务发生错误', error);
      if (!response.headersSent) response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('页面服务发生错误');
    });
  })().catch(error => {
    console.error('本地服务发生错误', error);
    if (!response.headersSent) response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('本地服务发生错误');
  });
});

let isClosing = false;
async function closeServer(exitCode) {
  if (isClosing) return;
  isClosing = true;

  await new Promise(resolve => server.close(resolve));
  await vite.close();
  database.close();
  process.exit(exitCode);
}

server.on('error', error => {
  console.error(`无法启动本地服务：http://${host}:${port}`, error);
  void closeServer(1);
});

process.once('SIGINT', () => void closeServer(0));
process.once('SIGTERM', () => void closeServer(0));

server.listen(port, host, () => {
  console.log(`本地页面与装备 API 已启动：http://${host}:${port}`);
  console.log(`装备数据库：${join(dataDirectory, 'gear.sqlite')}`);
});
