# FR-003: Offline Storage of Spell Data

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-001 (SRD spell data)  

---

## 1. Description

Support offline storage of spell data (local database). Spell data should be available without internet connection.

**Source**: PRD.md → FR-003

---

## 2. Detailed Specification

### 2.1 User Story

**As a** player, **I want to** access spell data offline, **so that** I can use the app at the table without internet.

### 2.2 Acceptance Criteria

- [ ] Spell data available offline after first load
- [ ] No network requests for spell data after initial load
- [ ] App works completely offline
- [ ] Spell data cached in localStorage or memory

### 2.3 UI Components Affected

- `spell-store.ts` - Caches spells in memory
- `storage-service.ts` - Persists spell data (if needed)

### 2.4 open20-core API Usage

```typescript
// Spells are bundled with open20-core, no API needed
// Just import and use directly
import { getSpell, getAllSpells } from 'open20-core';
```

---

## 3. Implementation Plan

### 3.1 Steps

1. Import spells from open20-core at build time (bundled)
2. Load spells into Zustand store on app startup
3. No async loading needed (spells are bundled)

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/stores/spell-store.ts` | Modify | Load spells on mount |
| `src/core/spell-service.ts` | Create | Wrap open20-core functions |

### 3.3 Estimated Effort

Small - 1 hour

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/offline-spell-data.test.ts
describe('FR-003: Offline Storage', () => {
  it('should load spells without network', () => {
    // Mock offline mode
    const spells = SpellService.getAllSpells();
    expect(spells.length).toBeGreaterThan(0);
  });
});
```

### 4.2 Integration Tests

- [ ] App works offline after first load
- [ ] No network requests for spell data

### 4.3 Manual Testing

- [ ] Disable network, reload app
- [ ] Verify spells still load
- [ ] Test all features offline

---

## 5. Implementation Notes

### 5.1 Decisions Made

- Spells bundled with open20-core (no async loading needed)
- No separate offline storage needed (spells are in npm package)

### 5.2 Challenges Encountered

- None (open20-core handles this)

### 5.3 Lessons Learned

- TBD

---

## 6. Completion Checklist

- [ ] Code implemented
- [ ] Unit tests written (80%+ coverage for P0)
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Committed with `[FR-003]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`

---

**Last Updated**: 2026-05-10  
**Updated By**: AI Agent
