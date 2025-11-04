# Design Guidelines: Markdown to PDF Converter

## Design Approach

**System Selected**: Linear/Notion-inspired productivity design system
**Rationale**: This is a utility-focused application where efficiency, clarity, and usability are paramount. The design should fade into the background, allowing users to focus on their content conversion task.

## Typography System

**Font Stack**:
- Primary: Inter (Google Fonts) - for UI elements, buttons, labels
- Monospace: JetBrains Mono (Google Fonts) - for markdown input and code blocks

**Type Scale**:
- Headings: text-2xl (24px) font-semibold
- Body: text-base (16px) font-normal
- Small text: text-sm (14px)
- Labels: text-xs (12px) font-medium uppercase tracking-wide
- Code/Markdown: text-sm font-mono

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 12 exclusively
- Micro spacing: p-2, gap-2 (component internal)
- Standard spacing: p-4, gap-4, m-4 (between elements)
- Section spacing: p-6, p-8 (containers, cards)
- Large spacing: p-12 (page margins)

**Container Strategy**:
- Main application: max-w-7xl mx-auto px-6
- No viewport height constraints - content flows naturally
- Responsive padding: px-4 (mobile) to px-6 (desktop)

## Component Library

### Core Layout

**Application Shell**:
- Clean header bar with app title and primary actions
- Full-width workspace below header
- No sidebar - single-page focus
- Footer with minimal metadata (optional usage stats)

**Split-Pane Workspace**:
```
Desktop (lg+): Two-column grid (grid-cols-2)
- Left: Markdown input area
- Right: Live preview pane
Mobile: Single column stack
- Input area first
- Preview below
```

### Primary Components

**File Upload Zone**:
- Large dropzone with dashed border
- Icon from Heroicons (document-arrow-up)
- Drag-and-drop state indicators
- File type badge and size display
- Clear "Remove" action after upload

**Markdown Editor Area**:
- Full-height textarea with clean borders
- Monospace font for editing
- Line numbers (optional enhancement)
- Character/word count display
- Syntax highlighting for preview only (not in textarea)

**Preview Pane**:
- Rendered markdown with proper styling
- Document-style padding and max-width
- Typography hierarchy reflecting final PDF
- Scroll independently from input

**Action Bar**:
- Primary CTA: "Convert to PDF" (prominent)
- Secondary actions: "Clear", "Download Sample"
- Processing state with subtle indicator
- Success feedback after conversion

**Settings Panel** (collapsible):
- PDF options: page size, margins
- Simple toggle switches
- Compact form layout

### Navigation & Interaction

**Top Bar**:
- App logo/title (left)
- Quick action buttons (right)
- Minimal, flat design
- Fixed position with subtle border-bottom

**Buttons**:
- Primary: Solid with rounded corners (rounded-lg)
- Secondary: Outlined with hover state
- Icon buttons: Square with icon only
- Disabled state: reduced opacity

## Visual Rhythm

**Vertical Flow**:
- Header: h-16 fixed height
- Workspace: Fills remaining viewport height
- Consistent internal padding: p-6 for major containers
- Gap between elements: gap-4 standard

**Cards & Containers**:
- Subtle borders: border border-gray-200
- Minimal shadows: shadow-sm
- Rounded corners: rounded-xl for major cards, rounded-lg for inputs
- Ample internal padding: p-6

## Interaction Patterns

**File Upload Flow**:
1. Drag file or click to browse
2. Immediate visual feedback on drop
3. File info display with preview option
4. Auto-populate editor with content

**Conversion Flow**:
1. Click "Convert to PDF"
2. Inline loading state (no modal)
3. Success state with download button
4. Auto-download option

**Responsive Behavior**:
- Mobile: Stack editor and preview vertically
- Tablet: Side-by-side if width permits
- Desktop: Full split-pane with resizable divider (optional enhancement)

## Icons

**Library**: Heroicons (via CDN)
**Key Icons**:
- document-arrow-up (upload)
- document-text (file)
- arrow-down-tray (download)
- x-mark (close/clear)
- cog-6-tooth (settings)

## Animations

**Use Sparingly**:
- File drop: Subtle scale animation on dropzone
- Loading: Simple spinner or progress bar
- Success: Brief checkmark fade-in
- NO scroll animations or complex transitions

## Images

**No images required** - This is a utility application focused on functionality. All visual elements are UI components, icons, and typography.

## Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation for file upload
- Focus states on all inputs and buttons
- High contrast text throughout
- Error states with clear messaging

## Design Principles

1. **Clarity Over Creativity**: Function first, aesthetics support the task
2. **Minimal Cognitive Load**: Obvious next steps, no hidden features
3. **Immediate Feedback**: Every action has visible response
4. **Professional Polish**: Clean, consistent, trustworthy interface
5. **Speed**: Fast interactions, no unnecessary delays