# Entity Relationship Diagram

## Entities & Relationships

```
User
 ├── id (cuid)
 ├── email (unique)
 ├── name
 ├── createdAt
 └── updatedAt

TodoList
 ├── id (cuid)
 ├── title
 ├── isPublic (bool)
 ├── ownerId → User
 ├── createdAt
 └── updatedAt

Category
 ├── id (cuid)
 ├── name
 ├── listId → TodoList
 ├── createdAt
 └── updatedAt

Todo
 ├── id (cuid)
 ├── title
 ├── isCompleted (bool)
 ├── deletedAt (soft delete, nullable)
 ├── listId → TodoList
 ├── categoryId → Category (nullable)
 ├── assignedTo → User (nullable)
 ├── createdAt
 └── updatedAt

TodoListMember          (join table — collaborators)
 ├── userId → User
 ├── listId → TodoList
 └── role: OWNER | EDITOR | VIEWER

Follow                  (self-join on User)
 ├── followerId → User
 └── followingId → User
```

## Relationship Summary

```
User         ──< TodoList         (one user owns many lists)
User         ──< TodoListMember   (user can be member of many lists)
TodoList     ──< TodoListMember   (list has many members, max 10)
TodoList     ──< Category         (categories scoped to a list)
TodoList     ──< Todo             (list has many todos)
Category     ──< Todo             (todo belongs to one category)
User         ──< Todo             (todo can be assigned to a user)
User         ──< Follow           (as follower)
User         ──< Follow           (as following)
```

## Key Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Category scope | Belongs to TodoList | Categories are list-specific, not global |
| Follow model | Join table `Follow` | Can't store array of IDs — no FK enforcement, no clean joins |
| Collaborator role | `role` column on `TodoListMember` | Need to distinguish OWNER / EDITOR / VIEWER |
| IDs | cuid | URL-safe, shorter than UUID, avoids enumeration attacks |
| Soft deletes | `deletedAt` on Todo | Recoverable, but requires `WHERE deletedAt IS NULL` on every query |
| Timestamps | `createdAt` + `updatedAt` on all tables | Always |
