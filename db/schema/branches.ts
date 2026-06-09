import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull(),
  name: text('name').notNull().default('main'),
  headCommitId: uuid('head_commit_id'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})