import { GearConflictError, GearValidationError } from './gearDatabase.mjs';

const MAX_BODY_BYTES = 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  let isTooLarge = false;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      isTooLarge = true;
      continue;
    }
    chunks.push(chunk);
  }

  if (isTooLarge) throw new HttpError(413, '请求内容过大');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, '请求 JSON 格式无效');
  }
}

export async function handleGearApi(request, response, database) {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname !== '/api' && !pathname.startsWith('/api/')) return false;

  if (pathname !== '/api/gear') {
    sendJson(response, 404, { error: '接口不存在' });
    return true;
  }

  try {
    if (request.method === 'GET') {
      sendJson(response, 200, database.getInventory());
      return true;
    }

    if (request.method === 'PUT') {
      const body = await readJsonBody(request);
      const inventory = database.replaceItems(body?.items, body?.revision);
      sendJson(response, 200, inventory);
      return true;
    }

    sendJson(response, 405, { error: '请求方法不支持' });
    return true;
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.status, { error: error.message });
      return true;
    }
    if (error instanceof GearValidationError) {
      sendJson(response, 400, { error: error.message });
      return true;
    }
    if (error instanceof GearConflictError) {
      sendJson(response, 409, { error: error.message });
      return true;
    }

    console.error('装备 API 发生错误', error);
    sendJson(response, 500, { error: '本地装备数据库发生错误' });
    return true;
  }
}
