"use client";

import { ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { appConfig } from "@readrabbit/config";

interface HorizontalScrollerProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function HorizontalScroller({
    children,
    className = "",
    contentClassName = "",
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
    const momentumConfig = appConfig.scrollerMomentum;

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
        <div className={`relative ${className}`}>
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
                <div className={`flex flex-nowrap gap-3 md:gap-4 pb-2 px-6 ${contentClassName}`}>
                    {children}
                </div>
            </div>
            {/* Fade out effect on right side for desktop */}
            <div className="hidden md:block absolute top-0 right-0 bottom-0 w-24 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        </div>
    );
}
