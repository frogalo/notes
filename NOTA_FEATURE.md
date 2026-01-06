# Nota Feature - Quick Guide

## Version 0.5.1.2

### What is Nota?

Nota is a new annotation system that allows you to add inline annotations to your text. It uses the `|` character as a delimiter with **smart cursor behavior**.

### How to Use

Simply type your text, then type the `|` character. **The cursor will automatically jump to the annotation area** so you can continue typing:

```
1. Type: "Meeting notes"
2. Type: "|" ← cursor automatically moves to annotation
3. Type: "2026-01-06"
4. Result: "Meeting notes |2026-01-06"
```

### Smart Features

#### 🎯 Auto-Cursor Jump
When you type `|`, the cursor **automatically enters the annotation box**. No need to click - just keep typing!

#### 📏 Auto-Width
Annotations **stick to the end of your text** and grow naturally with content. No fixed width constraints.

#### ⌨️ Seamless Typing
Type everything in one continuous flow:
```
**Bold text** works too |See the formatting!
```

### Visual Design

- Annotations appear **on the right** of your main text
- They use a beautiful Tailwind-inspired design with:
  - Gradient border (sky blue theme)
  - Backdrop blur effect
  - Shimmer animation on hover
  - Smooth transitions
  - Auto-sizing width

### Enter Key Behavior

- Pressing **Enter** in a nota line creates a new clean paragraph
- The new line will NOT have annotation syntax
- This allows you to exit annotation mode and continue writing normally

### Example Workflow

```
Type this (in one continuous flow):
Meeting Notes|2026-01-06
           ↑ cursor jumps here automatically

Project Status|On Track

Review Needed|High Priority
```

### Technical Details

- Annotations are `contenteditable` for direct typing
- Main text supports all inline markdown formatting (bold, italic, code, links)
- The `|` delimiter triggers automatic cursor positioning
- Annotations grow to fit content (no min/max width)
- Everything after `|` until newline becomes the annotation
- Annotations are visually distinct with cyan/blue gradient styling
