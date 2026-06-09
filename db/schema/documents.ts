import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  title: text('title').notNull().default('Untitled'),
  visibility: text('visibility').notNull().default('private'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})