"use client";

import { useState } from "react";
import { ArrowLeft, Check, X, Award } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function QuizPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const params = useParams();
    const storyId = params.storyId as Id<"stories">;
    const router = useRouter();

    const quiz = useQuery(api.quizzes.getQuizForStory, { storyId });

    if (quiz === undefined) {
        return <div className="flex min-h-screen items-center justify-center">Loading quiz...</div>;
    }

    if (quiz === null) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-xl font-bold text-slate-600">No quiz available for this story.</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const questions = quiz.questions.map(q => ({
        text: q.prompt,
        answers: q.options.map(o => o.label),
        correctIndex: q.options.findIndex(o => o.id === q.correctOptionId),
    }));

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
            <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-6 font-sans text-foreground md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="mb-12 flex flex-col items-center text-center">
                    <div className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                        <Award className="h-16 w-16 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                        Quiz Complete!
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        You got <span className="font-bold text-primary">{score}</span> out of <span className="font-bold">{questions.length}</span> correct
                    </p>
                </div>

                <div className="mb-12 flex w-full max-w-md flex-col gap-4">
                    {questions.map((q, idx) => (
                        <div key={idx} className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                            <div className="border-b border-border/50 bg-muted/30 p-4">
                                <p className="font-bold text-foreground">{q.text}</p>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className={`font-bold ${selectedAnswers[idx] === q.correctIndex ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                                    {q.answers[selectedAnswers[idx]]}
                                </span>
                                {selectedAnswers[idx] === q.correctIndex ? (
                                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                ) : (
                                    <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                        <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleFinish}
                    className="flex h-12 w-auto max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95"
                >
                    <span>Back to Stories</span>
                    <ArrowLeft className="h-6 w-6" />
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen w-full bg-gradient-to-b from-background to-muted/30 pb-24 font-sans text-foreground md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 px-6 pt-12 pb-6">
                <button
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm border border-border/50 transition-all hover:bg-muted ${currentQuestionIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Progress Bar */}
                <div className="flex flex-1 items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground min-w-[3rem] text-right">
                        {currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>

                <div className="w-10" />
            </header>

            <main className="flex flex-col gap-8 px-6">
                <div className="rounded-3xl bg-[#206a96] py-4 px-8 shadow-lg text-center">
                    <h2 className={`${currentQuestion.text.length > 100 ? "text-xl" : currentQuestion.text.length > 50 ? "text-2xl" : "text-3xl"} font-bold leading-relaxed tracking-tight text-white transition-all duration-300`}>
                        {currentQuestion.text}
                    </h2>
                </div>

                <div className="grid gap-4">
                    {currentQuestion.answers.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`group relative flex items-center justify-between rounded-2xl border p-6 text-left text-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${selectedAnswers[currentQuestionIndex] === index
                                ? "border-transparent bg-yellow-700 text-white shadow-lg shadow-yellow-700/20"
                                : "border-border/50 bg-card hover:border-primary/50 hover:shadow-md"
                                }`}
                        >
                            <span>{answer}</span>
                            <div className={`rounded-full p-1 ${selectedAnswers[currentQuestionIndex] === index ? "bg-white/20" : "bg-muted"}`}>
                                {selectedAnswers[currentQuestionIndex] === index ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <div className="h-5 w-5" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-6 md:relative md:p-0 md:px-6 md:pb-8 md:mt-8">
                <div className="mx-auto flex max-w-[85vw] items-center justify-center gap-4 md:max-w-full">
                    <button
                        onClick={handleFinish}
                        className="flex h-12 w-auto items-center justify-center rounded-full bg-muted px-6 text-lg font-bold text-muted-foreground transition-all hover:bg-muted/80 active:scale-95"
                    >
                        Skip
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        className={`flex h-12 w-auto max-w-md items-center justify-center gap-2 rounded-[2rem] px-8 text-xl font-bold text-white shadow-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 ${selectedAnswers[currentQuestionIndex] !== undefined
                            ? "bg-gradient-to-r from-orange-700/60 to-orange-600/60 hover:from-orange-700 hover:to-orange-600"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                    >
                        {isLastQuestion ? "Finish Quiz" : "Next Question"}
                    </button>
                </div>
            </footer>

            <BottomNav />
        </div>
    );
}
