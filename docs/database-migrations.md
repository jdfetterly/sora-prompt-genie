# Database Migrations Guide

This guide explains how to use Drizzle Kit for database migrations in SoraPromptGenie.

## Overview

SoraPromptGenie uses [Drizzle ORM](https://orm.drizzle.team/) with [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database schema management. Migrations allow you to version control your database schema and apply changes safely in production.

## Migration Workflow

### 1. Make Schema Changes

Edit `shared/schema.ts` to modify your database schema:

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 2. Generate Migration

After modifying the schema, generate a migration:

```bash
npm run db:generate
```

This will:
- Compare your current schema with the database
- Generate SQL migration files in `./migrations/`
- Create a timestamped migration file (e.g., `0000_snapshot.sql`)

### 3. Review Migration

Always review the generated migration file before applying:

```bash
cat migrations/0000_snapshot.sql
```

### 4. Apply Migration

Apply the migration to your database:

```bash
npm run db:migrate
```

**For Production:**
- Always backup your database before running migrations
- Test migrations on a staging environment first
- Run migrations during maintenance windows if possible
- Monitor the application after migration

## Migration Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:push` | Push schema changes directly (development only) |
| `npm run db:studio` | Open Drizzle Studio (visual database browser) |

## Development vs Production

### Development

In development, you can use `db:push` for rapid iteration:

```bash
npm run db:push
```

This directly syncs your schema without creating migration files. **Never use this in production.**

### Production

In production, always use migrations:

1. Make schema changes in `shared/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review the migration file
4. Apply migration: `npm run db:migrate`

## Migration Best Practices

1. **Always Review**: Never apply migrations blindly. Review the SQL before running.

2. **Backup First**: Always backup your production database before migrations.

3. **Test in Staging**: Test migrations in a staging environment that mirrors production.

4. **One Change Per Migration**: Keep migrations focused on a single change for easier rollback.

5. **Document Breaking Changes**: If a migration breaks existing functionality, document it clearly.

6. **Version Control**: Commit migration files to version control so all team members can apply them.

7. **Rollback Plan**: Have a plan to rollback if a migration fails or causes issues.

## Rollback Strategy

If you need to rollback a migration:

1. **Manual Rollback**: Write a new migration that reverses the changes
2. **Database Restore**: Restore from a backup taken before the migration
3. **Drizzle Kit**: Drizzle Kit doesn't have built-in rollback, so manual SQL or restore is needed

## Troubleshooting

### Migration Fails

If a migration fails:
1. Check the error message
2. Verify your database connection
3. Check if the migration conflicts with existing data
4. Restore from backup if needed

### Schema Drift

If your database schema drifts from your code:
1. Use `db:push` in development to sync
2. Generate a new migration to capture the current state
3. Review and apply carefully

## Environment Variables

Ensure `DATABASE_URL` is set in your environment:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Additional Resources

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)

