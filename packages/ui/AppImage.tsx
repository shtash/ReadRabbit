"use client";

import React, { useState, type ReactNode } from "react";

interface AppImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallback?: ReactNode;
    lazy?: boolean;
}

export function AppImage({
    src,
    alt,
    className = "",
    fallback,
    lazy = true,
}: AppImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    if (!src || errored) {
        return <>{fallback ?? null}</>;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={lazy ? "lazy" : undefined}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
    );
}
