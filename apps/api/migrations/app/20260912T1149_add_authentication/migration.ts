#!/usr/bin/env -S node
import type { Contract as Start } from "../../snapshots/2907cca8cbc358a09e21b310ff00fb3e5c0dd6458f7450ec7a7601a87480c2c8/contract";
import startContract from "../../snapshots/2907cca8cbc358a09e21b310ff00fb3e5c0dd6458f7450ec7a7601a87480c2c8/contract.json" with { type: "json" };
import type { Contract as End } from "../../snapshots/bd03b4cd4faa633a8ce8627bc721cfccdcddf32ab83b6ca0e6b29c76721026a4/contract";
import endContract from "../../snapshots/bd03b4cd4faa633a8ce8627bc721cfccdcddf32ab83b6ca0e6b29c76721026a4/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: "public",
        table: "invitation",
        columns: [
          col("consumedAt", "timestamptz", {
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("createdAt", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("expiresAt", "timestamptz", {
            notNull: true,
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("revokedAt", "timestamptz", {
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("tokenHash", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "passwordReset",
        columns: [
          col("consumedAt", "timestamptz", {
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("createdAt", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("expiresAt", "timestamptz", {
            notNull: true,
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("revokedAt", "timestamptz", {
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("tokenHash", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "session",
        columns: [
          col("createdAt", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("expiresAt", "timestamptz", {
            notNull: true,
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("revokedAt", "timestamptz", {
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("tokenHash", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("userId", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.addColumn({
        schema: "public",
        table: "user",
        column: col("isActive", "bool", {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: "pg/bool@1" },
        }),
      }),
      this.addColumn({
        schema: "public",
        table: "user",
        column: col("passwordHash", "text", {
          codecRef: { codecId: "pg/text@1" },
        }),
      }),
      this.addColumn({
        schema: "public",
        table: "user",
        column: col("role", "text", {
          notNull: true,
          default: lit("Participant"),
          codecRef: { codecId: "pg/text@1" },
        }),
      }),
      this.addUnique({
        schema: "public",
        table: "invitation",
        constraint: "invitation_tokenHash_key",
        columns: ["tokenHash"],
      }),
      this.addUnique({
        schema: "public",
        table: "passwordReset",
        constraint: "passwordReset_tokenHash_key",
        columns: ["tokenHash"],
      }),
      this.addUnique({
        schema: "public",
        table: "session",
        constraint: "session_tokenHash_key",
        columns: ["tokenHash"],
      }),
      this.addCheckConstraint({
        schema: "public",
        table: "user",
        constraint: "user_role_check_50a9063e",
        expression: "\"role\" IN ('Participant', 'Admin')",
      }),
      this.createIndex({
        schema: "public",
        table: "invitation",
        index: "invitation_userId_idx_a489d58a",
        columns: ["userId"],
      }),
      this.createIndex({
        schema: "public",
        table: "passwordReset",
        index: "passwordReset_userId_idx_a489d58a",
        columns: ["userId"],
      }),
      this.createIndex({
        schema: "public",
        table: "session",
        index: "session_userId_idx_a489d58a",
        columns: ["userId"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "invitation",
        foreignKey: {
          name: "invitation_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "user", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "passwordReset",
        foreignKey: {
          name: "passwordReset_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "user", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "session",
        foreignKey: {
          name: "session_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "user", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
