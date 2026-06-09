import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const documentCollaborators = pgTable('document_collaborators', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: text('role').notNull().default('viewer'),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
})