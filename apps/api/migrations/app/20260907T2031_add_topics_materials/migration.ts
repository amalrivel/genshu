#!/usr/bin/env -S node
import type { Contract as Start } from "../../snapshots/4afc7b0d7d11f178e53f9cc94ef6d1ecd6dba10716d25ddd6e90e690b02d14ea/contract";
import startContract from "../../snapshots/4afc7b0d7d11f178e53f9cc94ef6d1ecd6dba10716d25ddd6e90e690b02d14ea/contract.json" with { type: "json" };
import type { Contract as End } from "../../snapshots/a71895a1ab3fbc600c76907be93c2f06e52918b97cafde712731851f132d0680/contract";
import endContract from "../../snapshots/a71895a1ab3fbc600c76907be93c2f06e52918b97cafde712731851f132d0680/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: "public",
        table: "material",
        columns: [
          col("content", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("title", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("topicId", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        schema: "public",
        table: "topic",
        columns: [
          col("createdAt", "timestamptz", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
          col("id", "SERIAL", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("title", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("updatedAt", "timestamptz", {
            notNull: true,
            codecRef: { codecId: "pg/timestamptz-string@1" },
          }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createIndex({
        schema: "public",
        table: "material",
        index: "material_topicId_idx_6f05808f",
        columns: ["topicId"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "material",
        foreignKey: {
          name: "material_topicId_fkey",
          columns: ["topicId"],
          references: { schema: "public", table: "topic", columns: ["id"] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
