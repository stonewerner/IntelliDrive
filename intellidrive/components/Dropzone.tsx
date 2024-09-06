"use client";
import { cn } from "@/lib/utils";
import { useUser, useOrganization } from "@clerk/nextjs";
import React, { useState } from "react";
import DropzoneComponent from "react-dropzone";
import {
    addDoc,
    collection,
    serverTimestamp,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import toast from "react-hot-toast";
import { extractFileText } from "@/utils/textExtraction";

interface FileMetadata {
    downloadUrl: string;
    fileId: string;
    fileText: string;
    fileName: string;
}


interface DropzoneProps {
  isPersonal: boolean;
}

function Dropzone({ isPersonal }: DropzoneProps) {
    const maxSize = 20971520; //20MB

    const [loading, setLoading] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    const { organization } = useOrganization();

    const handleDrop = async (acceptedFiles: File[]) => {
        for (const file of acceptedFiles) {
            const firebaseFileInfo = await uploadFileToFirebase(file);
            if (firebaseFileInfo) {
                const fileText = await extractFileText(file);
                if (fileText) {
                    const fileMetadata = {
                        ...firebaseFileInfo,
                        fileText,
                        fileName: file.name,
                    };
                    await uploadToPinecone(fileMetadata);
                }
            }
        }
    };

    const uploadToPinecone = async (fileMetadata: FileMetadata) => {
        if (!user) return;


        const res = await fetch("/api/pinecone/upload_doc", {
            method: "POST",
            body: JSON.stringify({ namespace: user.id, fileMetadata }),
        });

        if (res.ok) {
            console.log("Successfully uploaded to Pinecone");
        } else {
            console.error("Failed to upload to Pinecone");
        }
    };

    const uploadFileToFirebase = async (selectedFile: File) => {
        if (loading) return; //to avoid duplicate upload
        if (!user) return; // TODO: update firebase rules after october 1st
        setLoading(true);
        const toastId = toast.loading("Uploading...");

        const collectionPath = isPersonal ? `users/${user.id}/files` : `organizations/${organization?.id}/files`;

        try {
            const docRef = await addDoc(collection(db, collectionPath), {
                userId: user.id,
                filename: selectedFile.name,
                fullName: user.fullName,
                profileImg: user.imageUrl,
                timestamp: serverTimestamp(),
                type: selectedFile.type,
                size: selectedFile.size,
            });
            const fileId = docRef.id;
            const imageRef = ref(storage, `${isPersonal ? `users/${user.id}` : `organizations/${organization?.id}`}/files/${docRef.id}`);
            const snapshot = await uploadBytes(imageRef, selectedFile);
            const downloadUrl = await getDownloadURL(snapshot.ref);
    
            // Update the document in the correct collection
            await updateDoc(doc(db, collectionPath, docRef.id), {
                downloadURL: downloadUrl,
            });
    
            toast.success("Uploaded Successfully", {
                id: toastId,
            });
            setLoading(false);
            return { downloadUrl, fileId };
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Upload failed", {
                id: toastId,
            });
            setLoading(false);
            return null;
        }
    };

    return (
        <DropzoneComponent minSize={0} maxSize={maxSize} onDrop={handleDrop}>
            {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragReject,
                fileRejections,
            }) => {
                const isFileTooLarge =
                    fileRejections.length > 0 &&
                    fileRejections[0].file.size > maxSize;
                return (
                    <section className="m-4">
                        <div
                            {...getRootProps()}
                            className={cn(
                                "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg text-center",
                                isDragActive
                                    ? "bg-[#035FFE] text-white animate-pulse"
                                    : "bg-slate-100/50 dark:bg-slate-800/80 text-slate-400"
                            )}
                        >
                            <input {...getInputProps()} />
                            {!isDragActive &&
                                "Click here or drop a file to upload!"}
                            {isDragActive &&
                                !isDragReject &&
                                "Drop to upload this file!"}
                            {isDragReject &&
                                "File type is not supported, sorry!"}
                            {isFileTooLarge && (
                                <div className="text-danger mt-2">
                                    File is too large.
                                </div>
                            )}
                        </div>
                    </section>
                );
            }}
        </DropzoneComponent>
    );
}

export default Dropzone;
