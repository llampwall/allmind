# Registry Setup Field UI Design

**Date**: 2026-02-05
**Status**: Approved

## Overview

Add visual support for the new `setup` field in registry entries. The setup field tracks setup health status separately from lifecycle status, with four possible states: succeeded, failed, skipped, and not_attempted.

## Registry Schema Addition

```json
{
  "name": "mobile-comfy",
  "path": "P:\\software\\mobile-comfy",
  "status": "active",
  "setup": {
    "result": "failed",
    "error": "venv creation failed",
    "last_attempt": "2026-02-05T10:10:28Z"
  }
}
```

## Visual Design

### 1. Status Badge (List View)

**Location**: Repository row, immediately after existing lifecycle status badge

**Badge Styles**:
- `succeeded` → Green badge: "SETUP: OK"
- `failed` → Red badge: "SETUP: FAILED"
- `skipped` → Yellow badge: "SETUP: SKIPPED"
- `not_attempted` / `null` → Gray badge: "SETUP: PENDING"

**Visibility**: Always visible for all repos

### 2. Expanded Details Section

**Location**: Within expanded repo details, after path/strap info, before action buttons

**Layout**:
```
Setup
  Status: SUCCEEDED
  Last attempt: 2h ago
```

For failures:
```
Setup
  Status: FAILED
  Error: venv creation failed
  Last attempt: 2h ago
```

**Visibility**: Always visible when repo is expanded

## Implementation Details

### Component Changes

1. **New Component**: `SetupBadge`
   - Similar to existing `StatusBadge`
   - Maps setup.result to colors and text
   - Handles null/undefined gracefully

2. **Modified Component**: `RepoRow`
   - Add `<SetupBadge>` after lifecycle status badge (line ~147)
   - Add setup details section in expanded view (line ~166-176)
   - Use existing `RelativeTime` for timestamp display

### Data Handling

- Read from `repo.setup?.result`, `repo.setup?.error`, `repo.setup?.last_attempt`
- No new API calls needed - data comes from existing `/api/repos`
- Gracefully handle missing setup field (old registry entries)
- Default to "PENDING" state for null/undefined

### Edge Cases

- Null setup field → treat as "not_attempted" (gray, PENDING)
- Empty error message → show "No error details"
- Missing timestamp → show "—"
- Malformed setup object → safely default to PENDING badge

## Color Scheme

Reusing existing dashboard color patterns:
- Green: `bg-green-500/20 text-green-400 border-green-500/30`
- Red: `bg-red-500/20 text-red-400 border-red-500/30`
- Yellow: `bg-yellow-500/20 text-yellow-400 border-yellow-500/30`
- Gray: `bg-gray-500/20 text-gray-400 border-gray-500/30`

## Files Modified

- `public/index.html` - Dashboard React component
