"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronLeft, X, Check, Minus, Plus } from "lucide-react";
import { FlexibleBirthdatePicker } from "@/components/FlexibleBirthdatePicker";
import Cropper from "react-easy-crop";
import getCroppedImg, { resizeImage } from "@/lib/imageUtils";
import { appConfig } from "@readrabbit/config";
import { Id } from "../../../../convex/_generated/dataModel";
import { ErrorModal } from "@/components/ErrorModal";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function AddCharacterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId");

    const createCharacter = useMutation(api.characters.createCharacter);
    const generateUploadUrl = useMutation(api.characters.generateUploadUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "boy",
        customType: "",
        birthYear: null as number | null,
        birthMonth: null as number | null,
        birthDay: null as number | null,
    });

    // Photo State
    const [originalPhotoBlob, setOriginalPhotoBlob] = useState<Blob | null>(null);
    const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Cropping State
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalPhotoBlob(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageSrc(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (tempImageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
                if (croppedImage) {
                    const resizedImage = await resizeImage(
                        croppedImage,
                        appConfig.parentDashboard.maxFaceImageSize,
                        appConfig.parentDashboard.maxFaceImageSize
                    );

                    setCroppedPhotoBlob(resizedImage);
                    setPhotoPreview(URL.createObjectURL(resizedImage));
                    setIsCropping(false);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleUpload = async (blob: Blob) => {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
        });
        const { storageId } = await result.json();
        return storageId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childId) {
            setError("Missing child ID");
            setShowErrorModal(true);
            return;
        }
        if (!formData.birthYear) {
            setError("Birth year is required");
            setShowErrorModal(true);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let originalImageStorageId = undefined;
            let faceImageStorageId = undefined;

            if (originalPhotoBlob && croppedPhotoBlob) {
                const [originalId, faceId] = await Promise.all([
                    handleUpload(originalPhotoBlob),
                    handleUpload(croppedPhotoBlob)
                ]);
                originalImageStorageId = originalId;
                faceImageStorageId = faceId;
            }

            const finalType = formData.type === "other" ? formData.customType : formData.type;

            await createCharacter({
                childId: childId as Id<"children">,
                name: formData.name,
                type: finalType,
                birthYear: formData.birthYear,
                birthMonth: formData.birthMonth === null ? undefined : formData.birthMonth,
                birthDay: formData.birthDay === null ? undefined : formData.birthDay,
                originalImageStorageId,
                faceImageStorageId,
            });

            router.back();
        } catch (error: any) {
            console.error("Failed to create character:", error);
            let errorMessage = error.message || "Failed to create character";

            // Clean up Convex error message
            if (errorMessage.includes("Uncaught Error: ")) {
                errorMessage = errorMessage.split("Uncaught Error: ")[1];
            }
            if (errorMessage.includes("at handler")) {
                errorMessage = errorMessage.split("at handler")[0];
            }

            errorMessage = errorMessage.trim();

            // Child-friendly error mapping
            if (errorMessage === "Invalid character name") {
                errorMessage = "That name isn't allowed. Please try a different one.";
            } else if (errorMessage === "Invalid character type") {
                errorMessage = "That type isn't allowed. Please try a different one.";
            }

            setError(errorMessage);
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!childId) {
        return <div className="p-8 text-center">Missing Child ID</div>;
    }

    return (
        <div className={`${appConfig.layout.workspaceContainer} relative flex flex-col items-center justify-center`}>
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Oops!"
                message={error || "An unknown error occurred"}
            />

            {/* Cropping Modal */}
            {isCropping && tempImageSrc && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 rounded-3xl">
                    <div className="relative w-[95%] md:w-[60%] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between bg-slate-800 p-4">
                            <button onClick={() => setIsCropping(false)} className="text-white hover:text-slate-300">
                                <X className="h-6 w-6" />
                            </button>
                            <h2 className="text-lg font-bold text-white">Frame Face</h2>
                            <button onClick={handleCropSave} className="text-orange-500 hover:text-orange-400">
                                <Check className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="relative h-[50vh] md:h-[60vh] w-full bg-black">
                            {/* @ts-expect-error - Types for react-easy-crop might be missing or incorrect */}
                            <Cropper
                                image={tempImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="bg-slate-800 p-6">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Zoom</span>
                                <span className="text-xs font-bold text-slate-400">{Math.round(zoom * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Minus className="h-4 w-4 text-slate-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-600 accent-orange-500"
                                />
                                <Plus className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full md:w-[30%] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="relative flex items-center justify-center border-b border-slate-100 p-4 dark:border-slate-800">
                    <button onClick={() => router.back()} className="absolute left-4 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold">Add Character</h1>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Photo Upload Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-orange-100 transition-all hover:opacity-90 active:scale-95 dark:bg-slate-800"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-orange-500 dark:text-orange-400">
                                        <div className="rounded-full bg-white/50 p-3 dark:bg-slate-700/50">
                                            <Camera className="h-6 w-6" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="text-xs font-bold text-white">Edit</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white"
                                    placeholder="Character Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 block">Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {["boy", "girl", "cat", "dog", "other"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${formData.type === type
                                                ? "bg-orange-500 text-white"
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                                }`}
                                        >
                                            {type === "boy" ? "Male" : type === "girl" ? "Female" : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {formData.type === "other" && (
                                    <input
                                        type="text"
                                        value={formData.customType}
                                        onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                                        className="mt-2 w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white"
                                        placeholder="e.g. Horse, Goldfish"
                                        required
                                    />
                                )}
                            </div>

                            <FlexibleBirthdatePicker
                                value={{ year: formData.birthYear, month: formData.birthMonth, day: formData.birthDay }}
                                onChange={(val) => setFormData({ ...formData, birthYear: val.year, birthMonth: val.month, birthDay: val.day })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded-full bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:bg-orange-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSubmitting ? "Creating..." : "Add Character"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
