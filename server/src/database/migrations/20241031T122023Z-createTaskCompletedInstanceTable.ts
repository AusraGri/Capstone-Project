import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('completed_tasks')
    .addColumn('id', 'integer', (c) => c.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('task_id', 'integer', (c)=> c.references('tasks.id').onDelete('cascade'))
    .addColumn('completed_at', 'timestamptz', (c)=> c.notNull())
    .addColumn('instance_date', 'timestamptz', (c)=> c.notNull())
    .addUniqueConstraint('unique_task_instance_date', ['task_id', 'instance_date'])
    .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('completed_tasks')
    .execute()
}