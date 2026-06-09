import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const mergeRequests = pgTable('merge_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceBranchId: uuid('source_branch_id').notNull(),
  targetBranchId: uuid('target_branch_id').notNull(),
  createdBy: uuid('created_by').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})