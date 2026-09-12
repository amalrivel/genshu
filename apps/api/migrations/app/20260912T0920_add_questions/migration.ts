#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6475ece15052fd17a6b80b4eb3607cf47b066c3062b40171669a6cf0e4823f98/contract';
import endContract from '../../snapshots/6475ece15052fd17a6b80b4eb3607cf47b066c3062b40171669a6cf0e4823f98/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a71895a1ab3fbc600c76907be93c2f06e52918b97cafde712731851f132d0680/contract';
import startContract from '../../snapshots/a71895a1ab3fbc600c76907be93c2f06e52918b97cafde712731851f132d0680/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'question',
        columns: [
          col('correctAnswer', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('furigana', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('indonesianExplanation', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('indonesianTranslation', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('japaneseExplanation', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('japaneseText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topicId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'question',
        index: 'question_topicId_idx_6f05808f',
        columns: ['topicId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'question',
        foreignKey: {
          name: 'question_topicId_fkey',
          columns: ['topicId'],
          references: { schema: 'public', table: 'topic', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
