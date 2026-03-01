import { integer } from 'drizzle-orm/gel-core';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable("state", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	token: text("token").notNull(),
	deletionTime: integer("deletion_time").notNull(),
	state: text("state", { mode:"json" }).notNull()
});
