# Version 0.5.1.1 - Nota Annotation Fixes

## Summary

Fixed nota annotation positioning and Enter key behavior as requested.

## Changes Made

### 1. Version Updates
- **package.json**: `0.5.1` → `0.5.1.1`
- **data/help.json**: Updated version to `0.5.1.1`
- **data/changelog.json**: Added new release entry

### 2. Annotation Positioning (Right Side)

**CSS Changes** (`renderer/styles.css`):
- Added `order: 1` to `.nota-main` (main text appears first visually on left)
- Added `order: 2` to `.nota-annotation` (annotation appears second on right)
- Changed hover transform from `translateX(-2px)` to `translateX(2px)` (moves right)

**TypeScript Changes** (`renderer/markdown_utils.ts`):
- Swapped HTML element order: main text before annotation
- HTML structure: `<nota-main>...<nota-annotation>...`

### 3. Enter Key Behavior

**TypeScript Changes** (`renderer/renderer.ts`):
- Added nota line detection in `handleEditorKeydown()`
- When Enter is pressed in a nota line:
  - Creates a new clean paragraph (no annotation syntax)
  - Moves cursor to the new line
  - Exits annotation mode
- Added `'nota-line'` to the list of classes cleared in `processBlock()`

### 4. Documentation Updates

**NOTA_FEATURE.md**:
- Updated version number
- Changed "left" to "right" in visual design description
- Added "Enter Key Behavior" section explaining the new functionality

**data/changelog.json**:
- Added version 0.5.1.1 with FIXED category:
  - "Nota annotations now correctly display on the right side of text"
  - "Pressing Enter in annotation text creates new line without removing annotation"

## Technical Implementation

### Flexbox Layout
```css
.nota-wrapper {
  display: flex;
  gap: 1.5em;
}

.nota-main {
  flex: 1;
  order: 1;  /* Appears first (left) */
}

.nota-annotation {
  flex-shrink: 0;
  order: 2;  /* Appears second (right) */
}
```

### Enter Key Logic
```typescript
if (block.classList.contains('nota-line')) {
  const newDiv = document.createElement('div');
  newDiv.innerHTML = '<br>';
  block.after(newDiv);
  // Move cursor to new line
  return;
}
```

## Usage Example

```
Lorem ipsum dolor sit amet |Important annotation
This is regular text |Another note
**Bold text** works here too |See the formatting!
```

Result:
- "Lorem ipsum dolor sit amet" appears on the left
- "Important annotation" badge appears on the right with glowing cyan border
- Pressing Enter creates a clean new line without the pipe or annotation

## Build Status

✅ TypeScript compilation successful
✅ No errors or warnings
✅ Ready for testing

## Testing Instructions

1. Reload the Electron app (the dev server is still running)
2. Type: `Test text |My annotation`
3. Verify the annotation appears on the RIGHT side
4. Press Enter while cursor is in the line
5. Verify a new clean paragraph is created without annotation syntax
