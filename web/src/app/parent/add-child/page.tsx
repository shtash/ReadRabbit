"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, Upload, X, Check, Minus, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import getCroppedImg, { resizeImage } from "@/lib/imageUtils";
import { appConfig } from "@readrabbit/config";

export default function AddChildPage() {
    const router = useRouter();
    const createChild = useMutation(api.children.createChild);
    const generateUploadUrl = useMutation(api.children.generateUploadUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        gender: "boy", // default
        birthdate: "",
    });

    // Photo State
    const [originalPhotoBlob, setOriginalPhotoBlob] = useState<Blob | null>(null);
    const [croppedPhotoBlob, setCroppedPhotoBlob] = useState<Blob | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Cropping State
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (tempImageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
                if (croppedImage) {
                    // Resize if needed (though getCroppedImg returns the crop size, we might want to ensure max size)
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
        setIsSubmitting(true);

        try {
            let originalImageStorageId = undefined;
            let faceImageStorageId = undefined;

            // Upload photos if they exist
            if (originalPhotoBlob && croppedPhotoBlob) {
                // Parallel uploads
                const [originalId, faceId] = await Promise.all([
                    handleUpload(originalPhotoBlob),
                    handleUpload(croppedPhotoBlob)
                ]);
                originalImageStorageId = originalId;
                faceImageStorageId = faceId;
            }

            const birthdateTimestamp = new Date(formData.birthdate).getTime();

            await createChild({
                name: formData.name,
                gender: formData.gender,
                birthdate: birthdateTimestamp,
                readingLevel: "emerging", // Default
                interests: [],
                avatarId: "rabbit_1", // Default avatar if no photo
                originalImageStorageId,
                faceImageStorageId,
            });

            router.push("/parent");
        } catch (error) {
            console.error("Failed to create child:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${appConfig.layout.workspaceContainer} relative flex flex-col items-center justify-center`}>
            {/* Cropping Modal - Positioned absolute relative to the workspace container */}
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
                            {/* @ts-ignore */}
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
                    <Link href="/parent" className="absolute left-4 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Personal Details</h1>
                </div>

                <div className="p-12">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        {/* Photo Upload Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="group relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-orange-100 transition-all hover:opacity-90 active:scale-95 dark:bg-slate-800"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-orange-500 dark:text-orange-400">
                                        <div className="rounded-full bg-white/50 p-3 dark:bg-slate-700/50">
                                            <Camera className="h-8 w-8" />
                                        </div>
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="text-xs font-bold text-white">Edit</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400"
                            >
                                Edit Photo
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white"
                                    placeholder="Child's Name"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between border-b-2 border-slate-200 py-2 dark:border-slate-700">
                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Sex</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: "boy" })}
                                        className={`rounded-full px-4 py-1 text-sm font-bold transition-colors ${formData.gender === "boy" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                                    >
                                        Boy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: "girl" })}
                                        className={`rounded-full px-4 py-1 text-sm font-bold transition-colors ${formData.gender === "girl" ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                                    >
                                        Girl
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Birthdate</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.birthdate}
                                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                        className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white dark:[color-scheme:dark]"
                                        required
                                    />
                                    <Calendar className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-4 w-full rounded-full bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:bg-orange-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSubmitting ? "Creating..." : "Done"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
