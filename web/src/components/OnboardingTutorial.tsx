"use client";

import { useState } from "react";
import { X, BookOpen, Compass, Home, Library, User } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

interface OnboardingStep {
    icon: typeof BookOpen;
    title: string;
    description: string;
}

const STEPS: OnboardingStep[] = [
    {
        icon: BookOpen,
        title: "Read",
        description: "Start reading stories! Choose from personalized adventures created just for your child.",
    },
    {
        icon: Compass,
        title: "Explore",
        description: "Discover new story categories, themes, and characters to expand your child's imagination.",
    },
    {
        icon: Home,
        title: "Home",
        description: "Your hub for featured stories, daily picks, and community favorites.",
    },
    {
        icon: Library,
        title: "Library",
        description: "Access your child's completed stories, reading history, and saved favorites.",
    },
    {
        icon: User,
        title: "Profile",
        description: "Manage child profiles, customize characters, and track reading progress.",
    },
];

export function OnboardingTutorial({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const router = useRouter();

    const currentStepData = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleComplete = async () => {
        setIsVisible(false);
        await completeOnboarding();
        onComplete();
        // Redirect to parent dashboard to add child
        router.push("/parent");
    };

    if (!isVisible) return null;

    const Icon = currentStepData.icon;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

            {/* Tutorial Modal */}
            <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 transform md:left-1/2 md:max-w-md md:-translate-x-1/2">
                <div className="animate-in fade-in zoom-in rounded-3xl bg-card p-8 shadow-2xl duration-300">
                    {/* Step Counter */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm font-bold text-muted-foreground">
                            Step {currentStep + 1} of {STEPS.length}
                        </span>
                        <button
                            onClick={handleComplete}
                            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="mb-3 text-center text-2xl font-bold text-foreground">
                        {currentStepData.title}
                    </h2>
                    <p className="mb-8 text-center text-lg text-muted-foreground">
                        {currentStepData.description}
                    </p>

                    {/* Final step extra message */}
                    {isLastStep && (
                        <div className="mb-6 rounded-2xl bg-primary/10 p-4 text-center">
                            <p className="font-bold text-primary">
                                Next: Add your child's profile in the Parent Dashboard!
                            </p>
                        </div>
                    )}

                    {/* Progress dots */}
                    <div className="mb-6 flex justify-center gap-2">
                        {STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all ${index === currentStep
                                    ? "w-6 bg-primary"
                                    : index < currentStep
                                        ? "bg-primary/50"
                                        : "bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="flex-1 rounded-full border-2 border-muted py-3 font-bold text-foreground transition-all hover:border-primary hover:bg-primary/5"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 rounded-full bg-primary py-3 font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                        >
                            {isLastStep ? "Get Started!" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
