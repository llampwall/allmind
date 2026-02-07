# TODO Status Update API Specification

## Endpoint

```
PUT /api/todos/:id
```

## Purpose

Allow agents and users to update task status through a simple API call. Supports workflow states: `open` → `in-progress` → `complete` or `failed`.

## Request

### URL Parameters

- `id` (string, required) - UUID of the todo item

### Request Body

```json
{
  "status": "open" | "in-progress" | "complete" | "failed",
  "notes": "optional status notes or failure reason"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | One of: `open`, `in-progress`, `complete`, `failed` |
| `notes` | string | No | Optional notes. Recommended for `failed` status to document what went wrong |

### Validation Rules

1. `status` must be one of the four allowed values
2. `notes` is always optional but recommended for `failed` status
3. Status transitions are unrestricted (any status can move to any other status)
4. Setting status to `complete` should set `completed_at` timestamp
5. Setting status to any other value should clear `completed_at`
6. **Notes handling**:
   - If `notes` is provided in request body, use that value (including explicit `null` to clear)
   - If `notes` is NOT provided in request body, clear it to `null` (prevents stale notes on status changes)

## Response

### Success (200 OK)

Returns the updated todo object:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Implement user authentication",
  "repo": "allmind",
  "priority": "high",
  "status": "complete",
  "notes": null,
  "created_at": "2026-02-07T12:00:00.000Z",
  "completed_at": "2026-02-07T13:30:00.000Z",
  "updated_at": "2026-02-07T13:30:00.000Z"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "Invalid status. Must be one of: open, in-progress, complete, failed"
}
```

Returned when:
- `status` field is missing
- `status` value is not one of the allowed enum values

#### 404 Not Found

```json
{
  "error": "Todo not found"
}
```

Returned when the todo with the given `id` does not exist.

## Schema Changes

Extends the existing TODO schema with new fields:

```javascript
{
  id: string,              // UUID (existing)
  text: string,            // Task description (existing)
  repo: string | null,     // Associated repo (existing)
  priority: enum,          // high/medium/low (existing)
  status: enum,            // NEW: open/in-progress/complete/failed
  notes: string | null,    // NEW: Status notes or failure reason
  created_at: string,      // ISO timestamp (existing)
  completed_at: string | null,  // ISO timestamp, set when status='complete' (existing)
  updated_at: string       // NEW: Last update timestamp
}
```

### Backward Compatibility

- Existing todos without `status` field default to `"open"`
- Existing todos without `notes` field default to `null`
- Existing todos without `updated_at` use `created_at` as fallback
- The `completed_at` field is automatically synced with `status`:
  - `status: "complete"` → sets `completed_at` to current timestamp
  - Other statuses → sets `completed_at` to `null`

## Usage Examples

### Mark Task In Progress

```bash
curl -X PUT http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Mark Task Complete

```bash
curl -X PUT http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "complete"}'
```

### Mark Task Failed with Notes

```bash
curl -X PUT http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "failed",
    "notes": "API endpoint returned 500 error, unable to reach server"
  }'
```

### Reopen Failed Task

```bash
# Notes will be automatically cleared since not provided in request
curl -X PUT http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "open"}'
```

### Reopen with New Notes

```bash
# Explicitly provide notes when reopening to document why retrying
curl -X PUT http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "notes": "Retrying after fixing API credentials"
  }'
```

## PowerShell Examples

### Mark Complete

```powershell
$body = @{
    status = "complete"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body
```

### Mark Failed with Notes

```powershell
$body = @{
    status = "failed"
    notes = "Dependencies not installed, ran into version conflict"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7780/api/todos/550e8400-e29b-41d4-a716-446655440000" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body
```

## Implementation Notes

1. **PUT vs PATCH**: This endpoint uses PUT semantics (requires status field) rather than PATCH (allows partial updates). The existing `/api/todos/:id` PATCH endpoint remains for updating text/repo/priority fields.

2. **Status History**: This spec does not include status history tracking. If needed, implement a separate `status_history` array field in a future iteration.

3. **Concurrency**: No optimistic locking is implemented. Last write wins. Consider adding `version` or `etag` field for concurrent updates in production.

4. **Timestamps**: All timestamps use ISO 8601 format in UTC timezone.

5. **Migration**: Existing todos.json will need migration to add default values for new fields. Consider running a migration script on server startup.

## Related Endpoints

- `GET /api/todos` - List todos (supports `?include_completed=true`)
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo fields (text, repo, priority)
- `DELETE /api/todos/:id` - Delete todo

## Testing Checklist

- [ ] Valid status transitions (open → in-progress → complete)
- [ ] Valid status transitions (open → in-progress → failed)
- [ ] Invalid status value returns 400
- [ ] Missing status field returns 400
- [ ] Non-existent todo ID returns 404
- [ ] Completing task sets completed_at timestamp
- [ ] Reopening task clears completed_at timestamp
- [ ] Notes field is optional
- [ ] Notes field accepts empty string
- [ ] Notes field accepts null
- [ ] Status transitions are unrestricted (can move from any status to any other)
- [ ] Response includes all todo fields including new status/notes
- [ ] Backward compatibility with existing todos without status field
