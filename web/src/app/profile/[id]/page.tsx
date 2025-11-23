"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { Camera, ChevronLeft, Trash2, Edit2, Save, X, Calendar, Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import Cropper from "react-easy-crop";
import getCroppedImg, { resizeImage } from "@/lib/imageUtils";
import { appConfig } from "@/config/app.config";

export default function ChildProfilePage() {
    const router = useRouter();
    const params = useParams();
    const childId = params.id as Id<"children">;

    const child = useQuery(api.children.getChild, { childId });
    const updateChild = useMutation(api.children.updateChild);
    const deleteChild = useMutation(api.children.deleteChild);
    const generateUploadUrl = useMutation(api.children.generateUploadUrl);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        gender: "boy",
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

    const [isSaving, setIsSaving] = useState(false);

    // Initialize form data when child data loads
    useEffect(() => {
        if (child) {
            setFormData({
                name: child.name,
                gender: child.gender || "boy",
                birthdate: child.birthdate ? new Date(child.birthdate).toISOString().split('T')[0] : "",
            });
        }
    }, [child]);

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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates: any = {
                childId,
                name: formData.name,
                gender: formData.gender,
                birthdate: new Date(formData.birthdate).getTime(),
            };

            // Upload new photos if they exist
            if (originalPhotoBlob && croppedPhotoBlob) {
                const [originalId, faceId] = await Promise.all([
                    handleUpload(originalPhotoBlob),
                    handleUpload(croppedPhotoBlob)
                ]);
                updates.originalImageStorageId = originalId;
                updates.faceImageStorageId = faceId;
            }

            await updateChild(updates);
            setIsEditMode(false);
            setOriginalPhotoBlob(null);
            setCroppedPhotoBlob(null);
            setPhotoPreview(null);
        } catch (error) {
            console.error("Failed to update child:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (child) {
            setFormData({
                name: child.name,
                gender: child.gender || "boy",
                birthdate: child.birthdate ? new Date(child.birthdate).toISOString().split('T')[0] : "",
            });
        }
        setIsEditMode(false);
        setOriginalPhotoBlob(null);
        setCroppedPhotoBlob(null);
        setPhotoPreview(null);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteChild({ childId });
            router.push("/parent");
        } catch (error) {
            console.error("Failed to delete child:", error);
            setIsDeleting(false);
        }
    };

    if (child === undefined) {
        return (
            <div className={`${appConfig.layout.workspaceContainer} flex items-center justify-center`}>
                <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (child === null) {
        return (
            <div className={`${appConfig.layout.workspaceContainer} flex flex-col items-center justify-center gap-4`}>
                <p className="text-xl font-medium text-slate-500">Child not found</p>
                <Link href="/parent" className="text-orange-500 hover:text-orange-600">Return to Dashboard</Link>
            </div>
        );
    }

    const displayPhoto = photoPreview || child.faceImageUrl;

    return (
        <div className={`${appConfig.layout.workspaceContainer} relative flex flex-col items-center justify-center`}>
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 rounded-3xl p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Delete {child.name}'s Profile?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            This action cannot be undone. All of {child.name}'s data will be permanently deleted.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 rounded-full bg-slate-200 dark:bg-slate-700 py-3 font-bold text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-full bg-red-500 py-3 font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full md:w-[30%] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                    <Link href="/parent" className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-lg font-bold">Profile Settings</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="p-8">
                    {/* Photo Section */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div
                            className={`group relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-orange-100 transition-all dark:bg-slate-800 ${isEditMode ? "cursor-pointer hover:opacity-90 active:scale-95" : ""
                                }`}
                            onClick={() => isEditMode && fileInputRef.current?.click()}
                        >
                            {displayPhoto ? (
                                <img src={displayPhoto} alt={child.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-orange-500 dark:text-orange-400">
                                    <div className="rounded-full bg-white/50 p-3 dark:bg-slate-700/50">
                                        <Camera className="h-8 w-8" />
                                    </div>
                                </div>
                            )}

                            {isEditMode && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="text-xs font-bold text-white">Change Photo</span>
                                </div>
                            )}
                        </div>

                        {isEditMode && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400"
                            >
                                Change Photo
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            disabled={!isEditMode}
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
                                disabled={!isEditMode}
                                className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white disabled:opacity-60"
                                placeholder="Child's Name"
                            />
                        </div>

                        <div className="flex items-center justify-between border-b-2 border-slate-200 py-2 dark:border-slate-700">
                            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Sex</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => isEditMode && setFormData({ ...formData, gender: "boy" })}
                                    disabled={!isEditMode}
                                    className={`rounded-full px-4 py-1 text-sm font-bold transition-colors ${formData.gender === "boy"
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        } disabled:opacity-60`}
                                >
                                    Boy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => isEditMode && setFormData({ ...formData, gender: "girl" })}
                                    disabled={!isEditMode}
                                    className={`rounded-full px-4 py-1 text-sm font-bold transition-colors ${formData.gender === "girl"
                                        ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        } disabled:opacity-60`}
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
                                    disabled={!isEditMode}
                                    className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg font-bold text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white dark:[color-scheme:dark] disabled:opacity-60"
                                />
                                <Calendar className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>


                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-4">
                        {!isEditMode ? (
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="flex items-center justify-center gap-2 rounded-full bg-orange-500 py-3 px-6 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:bg-orange-600 hover:scale-[1.02] active:scale-95"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center justify-center gap-2 rounded-full bg-red-500 py-3 px-6 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-transform hover:bg-red-600 hover:scale-[1.02] active:scale-95"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Profile
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex-1 rounded-full bg-slate-200 dark:bg-slate-700 py-4 text-lg font-bold text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:bg-orange-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    <Save className="h-5 w-5" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
