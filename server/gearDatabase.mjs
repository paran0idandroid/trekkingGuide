import { DatabaseSync } from 'node:sqlite';

const VALID_STATUSES = new Set(['owned', 'wanted']);
const VALID_SYSTEMS = new Set([
  'carry-storage',
  'shelter',
  'sleep',
  'wear-movement',
  'food-hydration',
  'navigation-safety',
]);

export class GearValidationError extends Error {}
export class GearConflictError extends Error {}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function isValidIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function validateItems(items) {
  if (!Array.isArray(items)) throw new GearValidationError('装备清单格式无效');

  const names = new Set();
  const ids = new Set();
  return items.map(item => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new GearValidationError('装备条目格式无效');
    }
    if (typeof item.id !== 'string' || !item.id.trim()) {
      throw new GearValidationError('装备 ID 无效');
    }
    if (ids.has(item.id)) throw new GearValidationError('装备 ID 重复');
    ids.add(item.id);
    if (typeof item.name !== 'string' || !item.name.trim()) {
      throw new GearValidationError('装备名称不能为空');
    }

    const name = item.name.trim();
    const normalizedName = normalizeName(name);
    if (names.has(normalizedName)) throw new GearValidationError('装备名称重复');
    names.add(normalizedName);

    if (!VALID_STATUSES.has(item.status)) {
      throw new GearValidationError('装备状态无效');
    }
    if (item.systemSlug !== null && !VALID_SYSTEMS.has(item.systemSlug)) {
      throw new GearValidationError('装备系统无效');
    }
    if (!isValidIsoDate(item.createdAt)) {
      throw new GearValidationError('装备创建时间无效');
    }

    return {
      id: item.id,
      name,
      normalizedName,
      status: item.status,
      systemSlug: item.systemSlug,
      createdAt: item.createdAt,
    };
  });
}

export function createGearDatabase(databasePath) {
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS gear_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('owned', 'wanted')),
      system_slug TEXT CHECK (
        system_slug IS NULL OR system_slug IN (
          'carry-storage',
          'shelter',
          'sleep',
          'wear-movement',
          'food-hydration',
          'navigation-safety'
        )
      ),
      created_at TEXT NOT NULL
    ) STRICT
  `);
  database.exec(`
    CREATE TABLE IF NOT EXISTS gear_metadata (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      revision INTEGER NOT NULL CHECK (revision >= 0)
    ) STRICT;
    INSERT OR IGNORE INTO gear_metadata (id, revision) VALUES (1, 0)
  `);

  const listStatement = database.prepare(`
    SELECT id, name, status, system_slug, created_at
    FROM gear_items
    ORDER BY created_at DESC
  `);
  const insertStatement = database.prepare(`
    INSERT INTO gear_items (
      id, name, normalized_name, status, system_slug, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const revisionStatement = database.prepare('SELECT revision FROM gear_metadata WHERE id = 1');
  const updateRevisionStatement = database.prepare(
    'UPDATE gear_metadata SET revision = ? WHERE id = 1',
  );

  const listItems = () => listStatement.all().map(row => ({
    id: row.id,
    name: row.name,
    status: row.status,
    systemSlug: row.system_slug,
    createdAt: row.created_at,
  }));

  const getInventory = () => ({
    items: listItems(),
    revision: revisionStatement.get().revision,
  });

  const replaceItems = (items, expectedRevision) => {
    const validatedItems = validateItems(items);
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
      throw new GearValidationError('装备清单版本无效');
    }
    database.exec('BEGIN IMMEDIATE');
    try {
      const currentRevision = revisionStatement.get().revision;
      if (currentRevision !== expectedRevision) {
        throw new GearConflictError('装备清单已更新，请刷新后重试');
      }
      database.exec('DELETE FROM gear_items');
      for (const item of validatedItems) {
        insertStatement.run(
          item.id,
          item.name,
          item.normalizedName,
          item.status,
          item.systemSlug,
          item.createdAt,
        );
      }
      updateRevisionStatement.run(currentRevision + 1);
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
    return getInventory();
  };

  return {
    getInventory,
    replaceItems,
    close: () => database.close(),
  };
}
