# Horizontal Scroller Implementation

This document explains how subject/item scrolling works on both desktop and mobile in the Regalify codebase.

## Overview

The scrolling is handled by a reusable `HorizontalScroller` component that provides:
- **Mobile**: Native touch swipe scrolling (browser-native)
- **Desktop**: Click-and-drag scrolling with optional momentum (custom mouse event handlers)

---

## 1. Configuration

**File:** `src/zestify/config.ts`

The scroller behavior is configurable via `ZESTIFY_CONFIG.scrollerMomentum`:

```typescript
scrollerMomentum: {
  enabled: true,           // Toggle momentum on/off
  friction: 0.92,          // How quickly momentum slows (0.90-0.98, higher = more slide)
  minVelocity: 0.1,        // Velocity threshold to stop animation (pixels/ms)
  velocitySmoothing: 0.5,  // Smoothing factor for velocity (0-1, higher = more responsive)
},
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Whether momentum scrolling is active |
| `friction` | number | `0.92` | Deceleration rate. Range: 0.90-0.98. Higher = more slide |
| `minVelocity` | number | `0.1` | Velocity (px/ms) below which animation stops |
| `velocitySmoothing` | number | `0.5` | Smoothing for velocity calculation. 0-1. Higher = more responsive to current movement |

---

## 2. The HorizontalScroller Component

**File:** `src/components/studio/HorizontalScroller.tsx`

```tsx
"use client";

import { ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { ZESTIFY_CONFIG } from "@/zestify/config";

interface HorizontalScrollerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HorizontalScroller({
  children,
  title,
  subtitle,
  className = "",
}: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Use ref for hasMoved so click handler can see it synchronously
  const hasMovedRef = useRef(false);

  // Momentum tracking refs
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Get momentum config
  const momentumConfig = ZESTIFY_CONFIG.scrollerMomentum;

  // Stop any ongoing momentum animation
  const stopMomentum = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    velocityRef.current = 0;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    // Stop any ongoing momentum
    stopMomentum();
    
    // Prevent native image/element dragging
    e.preventDefault();
    setIsDragging(true);
    hasMovedRef.current = false;
    setStartX(e.clientX);
    setScrollLeft(scrollRef.current.scrollLeft);
    
    // Initialize velocity tracking
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Reset hasMovedRef after a short delay (click event fires first, then this resets)
    setTimeout(() => { hasMovedRef.current = false; }, 10);

    // Check if user paused before releasing - if so, no momentum
    const timeSinceLastMove = performance.now() - lastTimeRef.current;
    const userPaused = timeSinceLastMove > 50; // 50ms pause = user stopped intentionally

    // Start momentum scrolling if enabled, user didn't pause, and we have velocity
    if (momentumConfig.enabled && !userPaused && Math.abs(velocityRef.current) > momentumConfig.minVelocity) {
      const animate = () => {
        if (!scrollRef.current || Math.abs(velocityRef.current) < momentumConfig.minVelocity) {
          animationRef.current = null;
          velocityRef.current = 0;
          return;
        }

        // Apply velocity (multiply by ~16ms frame time)
        scrollRef.current.scrollLeft -= velocityRef.current * 16;
        // Apply friction
        velocityRef.current *= momentumConfig.friction;
        
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  }, [momentumConfig]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    
    const now = performance.now();
    const deltaX = e.clientX - startX;

    // Calculate velocity (pixels per ms) - only if momentum is enabled
    if (momentumConfig.enabled) {
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        // Smooth velocity with configurable averaging
        const instantVelocity = (e.clientX - lastXRef.current) / dt;
        const smoothing = momentumConfig.velocitySmoothing;
        velocityRef.current = velocityRef.current * (1 - smoothing) + instantVelocity * smoothing;
      }
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }

    if (Math.abs(deltaX) > 5) {
      hasMovedRef.current = true;
    }

    scrollRef.current.scrollLeft = scrollLeft - deltaX;
  }, [isDragging, startX, scrollLeft, momentumConfig]);

  // Global mouse event listeners for drag handling
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup momentum animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`${className}`}>
      {title && (
        <div className="mb-2 px-4 md:max-w-screen-2xl md:mx-auto">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
      )}
      <div className="relative md:max-w-screen-2xl md:mx-auto">
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => {
            // Block click events on children if user was dragging
            if (hasMovedRef.current) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          <div className="flex gap-2 px-4 pb-2">{children}</div>
        </div>
        {/* Fade out effect on right side for desktop */}
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-24 pointer-events-none bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent" />
      </div>
    </div>
  );
}
```

---

## 3. Required CSS

**File:** `src/app/globals.css`

Add these utility classes to hide the scrollbar across all browsers:

```css
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
```

---

## 4. Example Usage

Here's how to use the component in a page:

```tsx
import { HorizontalScroller } from "@/components/studio/HorizontalScroller";
import { SubjectCard } from "@/components/studio/SubjectCard";

// Inside your component:
<HorizontalScroller
  title="Subject (select 1)"
  className="py-2 border-b border-gray-300 dark:border-gray-800"
>
  {subjects.map((subject) => (
    <SubjectCard
      key={subject._id.toString()}
      name={subject.name}
      thumbnailUrl={subject.thumbnailUrl}
      isSelected={selectedSubjectId === subject._id}
      onClick={() => handleSelectSubject(subject._id)}
    />
  ))}
</HorizontalScroller>
```

---

## 5. How It Works

### Platform Behavior

| Platform | Scrolling Method |
|----------|------------------|
| **Mobile** | Native touch swipe via `overflow-x-auto` (browser handles everything) |
| **Desktop** | Click-and-drag via custom mouse event handlers + momentum animation |

### Key Implementation Details

1. **Mobile scrolling**: Just uses CSS `overflow-x-auto`. The browser's native touch scrolling handles everything automatically. No JavaScript needed.

2. **Desktop drag-to-scroll**: Custom implementation using mouse events:
   - `mousedown`: Start tracking drag position, record initial `scrollLeft`, cancel any ongoing momentum
   - `mousemove`: Calculate delta from start position, update `scrollLeft`, track velocity
   - `mouseup`: Stop tracking, start momentum animation if enabled

3. **Momentum scrolling** (configurable):
   - On release, continues scrolling with the current velocity
   - Uses `requestAnimationFrame` for smooth 60fps animation
   - Applies friction each frame until velocity drops below threshold
   - Can be disabled entirely via config

4. **Pause detection**:
   - If user stops moving for >50ms before releasing, momentum is skipped
   - Prevents residual momentum when user intentionally stops scrolling
   - Checks `timeSinceLastMove` on mouseup to detect intentional stops

5. **Velocity calculation**:
   - Tracks position and time on each mouse move
   - Uses configurable smoothing to average instant velocity with previous value
   - Prevents jitter from erratic mouse movements

6. **Scrollbar hidden**: Cross-browser CSS hides the scrollbar while keeping scroll functionality intact.

7. **Click vs Drag detection**: The `hasMovedRef` ref with a 5px movement threshold prevents accidental item selections during drag operations. If the mouse moves more than 5px, it's considered a drag (not a click). Uses `onClickCapture` to intercept and block click events from reaching children when dragging.

8. **Global event listeners**: Mouse events are attached to `document` (not just the scroller element) so dragging continues smoothly even if the cursor leaves the scroller area.

9. **Visual polish**: A right-side fade gradient (desktop only, via `hidden md:block`) hints to users that more content is available to the right.

10. **Drag prevention**: `onDragStart={(e) => e.preventDefault()}` prevents the browser's native drag behavior on images/elements inside the scroller.

11. **User experience during drag**: 
    - `cursor: grabbing` shows a grabbing hand cursor
    - `userSelect: none` prevents text selection while dragging

---

## 6. Tailwind Classes Used

- `overflow-x-auto` - enables horizontal scrolling
- `scrollbar-hide` - custom utility class (defined in CSS above)
- `cursor-grab` - shows grab cursor on hover
- `select-none` - prevents text selection
- `flex gap-2` - horizontal layout with spacing for children
- `hidden md:block` - shows fade gradient only on desktop (md breakpoint and up)

---

## 7. Tuning Momentum

To adjust the feel of momentum scrolling, edit `src/zestify/config.ts`:

```typescript
scrollerMomentum: {
  enabled: true,           // Set to false to disable momentum entirely
  friction: 0.92,          // Lower (0.90) = stops quickly, Higher (0.98) = slides far
  minVelocity: 0.1,        // Lower = smoother stop, Higher = snappier stop
  velocitySmoothing: 0.5,  // Lower = more averaged/smooth, Higher = more responsive
},
```

### Recommended presets:

**Snappy (iOS-like)**:
```typescript
friction: 0.90,
minVelocity: 0.2,
velocitySmoothing: 0.7,
```

**Smooth (long glide)**:
```typescript
friction: 0.96,
minVelocity: 0.05,
velocitySmoothing: 0.4,
```

**Disabled**:
```typescript
enabled: false,
```
