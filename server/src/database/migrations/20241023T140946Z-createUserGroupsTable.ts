import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('user_groups')
    .addColumn('user_id', 'integer', (c) => c.notNull().references('user.id').onDelete('cascade'))
    .addColumn('group_id', 'integer', (c) => c.notNull().references('groups.id').onDelete('cascade'))
    .addPrimaryKeyConstraint('user_group_pk', ['user_id', 'group_id']) // composite primary key
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('user_groups')
    .execute()
}