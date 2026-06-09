import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const commits = pgTable('commits', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull(),
  parentCommitId: uuid('parent_commit_id'),
  authorId: uuid('author_id').notNull(),
  message: text('message').default(''),
  stateUrl: text('state_url').notNull(),
  isSnapshot: boolean('is_snapshot').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})