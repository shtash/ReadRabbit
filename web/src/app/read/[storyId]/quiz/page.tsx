"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    // Mock questions for now (should come from story in real app)
    const questions = [
        {
            text: "What color was the magical book?",
            answers: ["Blue", "Glowing in the dark", "Red", "Invisible"],
            correctIndex: 1,
        },
        {
            text: "Who did the rabbit meet?",
            answers: ["A fox", "A bear", "A wise owl", "A robot"],
            correctIndex: 2,
        },
        {
            text: "Where did they go?",
            answers: ["To the moon", "To the forest", "To the city", "To the beach"],
            correctIndex: 1,
        }
    ];

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswerSelect = (answerIndex: number) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: answerIndex
        }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsSubmitted(true);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleFinish = () => {
        router.push("/read"); // Or back to dashboard
    };

    // Calculate score if submitted
    const score = isSubmitted ? questions.reduce((acc, q, idx) => {
        return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0) : 0;

    if (isSubmitted) {
        return (
            <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold text-primary">Quiz Complete!</h1>
                    <p className="text-2xl font-bold text-foreground">
                        You got {score} out of {questions.length} correct!
                    </p>
                </div>

                <div className="mb-8 flex flex-col gap-4 w-full max-w-md">
                    {questions.map((q, idx) => (
                        <div key={idx} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
                            <p className="font-bold mb-2">{q.text}</p>
                            <div className="flex justify-between items-center">
                                <span className={selectedAnswers[idx] === q.correctIndex ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                    {q.answers[selectedAnswers[idx]]}
                                </span>
                                {selectedAnswers[idx] === q.correctIndex ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                    <X className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleFinish}
                    className="flex h-16 w-full max-w-md items-center justify-center gap-2 rounded-full bg-primary text-xl font-bold text-white shadow-xl transition-all hover:bg-primary/90 active:scale-95"
                >
                    <span>Back to Stories</span>
                    <ArrowLeft className="h-6 w-6" />
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen w-full bg-background font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-12 pb-6">
                <button
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 ${currentQuestionIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="text-lg font-bold text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className="w-10" />
            </header>

            <main className="flex flex-col gap-8 px-6">
                <div className="rounded-3xl bg-card p-8 shadow-sm dark:bg-card/50">
                    <h2 className="text-2xl font-bold leading-relaxed">
                        {currentQuestion.text}
                    </h2>
                </div>

                <div className="grid gap-4">
                    {currentQuestion.answers.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`group relative flex items-center justify-between rounded-2xl p-6 text-left text-lg font-bold transition-all active:scale-95 ${selectedAnswers[currentQuestionIndex] === index
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            <span>{answer}</span>
                            {selectedAnswers[currentQuestionIndex] === index && (
                                <div className="rounded-full bg-white/20 p-1">
                                    <Check className="h-6 w-6" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-6 md:relative md:p-0 md:px-6 md:pb-8 md:mt-8">
                <div className="mx-auto flex max-w-[85vw] justify-center md:max-w-full">
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        className={`flex h-20 w-full max-w-md items-center justify-center gap-2 rounded-[2rem] text-xl font-bold text-white shadow-xl transition-all active:scale-95 ${selectedAnswers[currentQuestionIndex] !== undefined
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                    >
                        {isLastQuestion ? "Finish Quiz" : "Next Question"}
                    </button>
                </div>
            </footer>
        </div>
    );
}
