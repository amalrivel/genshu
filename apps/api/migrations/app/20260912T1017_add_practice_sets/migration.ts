#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2907cca8cbc358a09e21b310ff00fb3e5c0dd6458f7450ec7a7601a87480c2c8/contract';
import endContract from '../../snapshots/2907cca8cbc358a09e21b310ff00fb3e5c0dd6458f7450ec7a7601a87480c2c8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6475ece15052fd17a6b80b4eb3607cf47b066c3062b40171669a6cf0e4823f98/contract';
import startContract from '../../snapshots/6475ece15052fd17a6b80b4eb3607cf47b066c3062b40171669a6cf0e4823f98/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'practiceSet',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'practiceSetQuestion',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('position', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('practiceSetId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('questionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'practiceSetQuestion',
        constraint: 'practiceSetQuestion_practiceSetId_questionId_key',
        columns: ['practiceSetId', 'questionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'practiceSetQuestion',
        constraint: 'practiceSetQuestion_practiceSetId_position_key',
        columns: ['practiceSetId', 'position'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'practiceSetQuestion',
        index: 'practiceSetQuestion_practiceSetId_idx_991c1578',
        columns: ['practiceSetId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'practiceSetQuestion',
        index: 'practiceSetQuestion_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'practiceSetQuestion',
        foreignKey: {
          name: 'practiceSetQuestion_practiceSetId_fkey',
          columns: ['practiceSetId'],
          references: { schema: 'public', table: 'practiceSet', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'practiceSetQuestion',
        foreignKey: {
          name: 'practiceSetQuestion_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'question', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
