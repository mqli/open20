# FR-XXX: [Requirement Name]

**Priority**: P0/P1/P2  
**Status**: 📋 Planned / 🚧 In Progress / ✅ Completed / ❌ Blocked  
**Assigned To**: [Agent Name]  
**Depends On**: [List dependencies]  

---

## 1. Description

[Brief description from PRD.md]

**Source**: PRD.md → FR-XXX

---

## 2. Detailed Specification

### 2.1 User Story

**As a** [user role], **I want to** [action], **so that** [benefit].

### 2.2 Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### 2.3 UI Components Affected

- `ComponentName.tsx` - [What changes]
- `StoreName.ts` - [What state changes]

### 2.4 open20-core API Usage

```typescript
// Which open20-core functions are needed?
import { functionName } from 'open20-core';

// How to use them
const result = functionName(params);
```

---

## 3. Implementation Plan

### 3.1 Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### 3.2 Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/...` | Create | New component |
| `src/stores/...` | Modify | Add state |

### 3.3 Estimated Effort

[Small/Medium/Large] - [X hours/days]

---

## 4. Test Plan

### 4.1 Unit Tests

```typescript
// tests/unit/fr-XXX.test.ts
describe('FR-XXX: [Name]', () => {
  it('should [expected behavior]', () => {
    // Test implementation
  });
});
```

### 4.2 Integration Tests

- [ ] Test case 1
- [ ] Test case 2

### 4.3 Manual Testing

- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Test keyboard navigation
- [ ] Test screen reader

---

## 5. Implementation Notes

### 5.1 Decisions Made

- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

### 5.2 Challenges Encountered

- [Challenge 1]: [How resolved]

### 5.3 Lessons Learned

- [Lesson 1]

---

## 6. Completion Checklist

- [ ] Code implemented
- [ ] Unit tests written (80%+ coverage for P0)
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Committed with `[FR-XXX]` prefix
- [ ] Status updated to ✅ in `requirements/README.md`
- [ ] `docs/tech-design/` updated (if needed)

---

**Last Updated**: [Date]  
**Updated By**: [Agent Name]
