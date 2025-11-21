"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const router = useRouter();

    const question = {
        text: "What color was the magical book?",
        answers: ["Blue", "Glowing in the dark", "Red", "Invisible"],
        correctIndex: 1,
    };

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        const correct = index === question.correctIndex;
        setIsCorrect(correct);

        if (correct) {
            setTimeout(() => {
                router.push("/rewards");
            }, 1500);
        }
    };

    return (
        <div className="mx-auto min-h-screen w-full bg-background font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 pt-12 pb-6">
                <Link
                    href="/read"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Quiz Time!
                    </h1>
                </div>
            </header>

            <main className="flex flex-col gap-8 px-6">
                <div className="rounded-3xl bg-card p-8 shadow-sm dark:bg-card/50">
                    <h2 className="text-2xl font-bold leading-relaxed">
                        {question.text}
                    </h2>
                </div>

                <div className="grid gap-4">
                    {question.answers.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedAnswer !== null}
                            className={`group relative flex items-center justify-between rounded-2xl p-6 text-left text-lg font-bold transition-all active:scale-95 ${selectedAnswer === index
                                    ? isCorrect
                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                        : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            <span>{answer}</span>
                            {selectedAnswer === index && (
                                <div className="rounded-full bg-white/20 p-1">
                                    {isCorrect ? (
                                        <Check className="h-6 w-6" />
                                    ) : (
                                        <X className="h-6 w-6" />
                                    )}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
