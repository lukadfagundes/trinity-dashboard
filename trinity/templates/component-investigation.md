# Component Investigation Template

## Component Information
- **Component Name**: [Component Name]
- **File Path**: [Absolute Path]
- **Investigation Date**: [Date]
- **Investigator**: [Name/ID]

## Investigation Context
**Issue Description**: [Describe the issue or investigation goal]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What is happening]

**Priority Level**: [Critical/High/Medium/Low]

## Component Analysis

### Props Analysis
```typescript
// Component props interface
interface ComponentProps {
  // Document prop types here
}
```

### State Analysis
```typescript
// Component state structure
const [state, setState] = useState({
  // Document state structure
});
```

### Hooks Usage
- [ ] useState
- [ ] useEffect
- [ ] useContext
- [ ] useMemo
- [ ] useCallback
- [ ] Custom hooks: [List]

### Dependencies
- External libraries: [List]
- Internal components: [List]
- Utility functions: [List]

## Investigation Steps

### Step 1: [Description]
**Action**: [What was done]
**Result**: [What was observed]
**Code Changes**: [If any]

### Step 2: [Description]
**Action**: [What was done]
**Result**: [What was observed]
**Code Changes**: [If any]

## Findings

### Root Cause
[Description of the root cause]

### Technical Details
[Technical explanation]

### Performance Impact
[If applicable]

## Resolution

### Solution Implemented
[Describe the solution]

### Code Changes
```typescript
// Before
[Original code]

// After
[Modified code]
```

### Testing
- [ ] Unit tests updated
- [ ] Integration tests passed
- [ ] Manual testing completed
- [ ] Performance verified

## Prevention

### Best Practices Identified
1. [Practice 1]
2. [Practice 2]
3. [Practice 3]

### Pattern Documentation
[Link to pattern documentation if created]

## Follow-up Actions
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

## Investigation Metrics
- **Time Invested**: [Hours]
- **Files Modified**: [Count]
- **Tests Added/Updated**: [Count]
- **Performance Improvement**: [If measurable]