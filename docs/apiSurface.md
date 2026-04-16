# API Surface

## Users
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/users | Register |
| GET | /api/v1/users/me | Current user's profile |
| PATCH | /api/v1/users/me | Update current user |
| DELETE | /api/v1/users/me | Delete account |

## Todo Lists
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/todolists | All lists visible to the user. Query: `?cursor=<id>&limit=<n>`. Returns `PaginatedResponse<TodoListSummaryDTO>` |
| POST | /api/v1/todolists | Create a list |
| GET | /api/v1/todolists/:id | Get one list |
| PATCH | /api/v1/todolists/:id | Update a list |
| DELETE | /api/v1/todolists/:id | Delete a list |

## Todos
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/todolists/:id/todos | Todos in a list. Query: `?cursor=<id>&limit=<n>`. Returns `PaginatedResponse<TodoDTO>` |
| POST | /api/v1/todolists/:id/todos | Create a todo in a list |
| GET | /api/v1/todolists/:id/todos/:todoId | Get one todo |
| PATCH | /api/v1/todolists/:id/todos/:todoId | Update a todo |
| DELETE | /api/v1/todolists/:id/todos/:todoId | Delete a todo |

## Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/categories | All categories |
| POST | /api/v1/categories | Create a category |

## Follows
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/users/me/follows | Who the current user follows |
| POST | /api/v1/follows | Follow someone |
| DELETE | /api/v1/follows/:id | Unfollow |

## Feed
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/feed | Activity from followed users |
