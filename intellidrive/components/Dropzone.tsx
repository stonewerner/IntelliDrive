'use client'

import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import DropzoneComponent from 'react-dropzone'
import {addDoc, collection, serverTimestamp, updateDoc, doc} from "firebase/firestore"
import { db, storage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import toast from 'react-hot-toast';

function Dropzone() {
    const maxSize = 20971520; //20MB

    const [loading, setLoading] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();

    const onDrop = (acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            // TODO: toast notifcation on error instead of console log
            reader.onabort = () => console.log("file reading was aborted");
            reader.onerror = () => console.log("file reading failed");
            reader.onload = async () => {
                await uploadPost(file);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const uploadPost = async (selectedFile: File) => {
        if (loading) return; //to avoid duplicate upload
        if (!user) return; // TODO: update firebase rules after october 1st
        setLoading(true);
        const toastId = toast.loading("Uploading...");

        const docRef = await addDoc(collection(db, "users", user.id, "files"), {
            userId: user.id,
            filename: selectedFile.name,
            fullName: user.fullName,
            profileImg: user.imageUrl,
            timestamp: serverTimestamp(),
            type: selectedFile.type,
            size: selectedFile.size,
        })
        const imageRef = ref(storage, `users/${user.id}/files/${docRef.id}`);
        uploadBytes(imageRef, selectedFile).then(async (snapshot) => {
            const downloadURL = await getDownloadURL(imageRef);

            await updateDoc(doc(db, "users", user.id, "files", docRef.id), {
                downloadURL: downloadURL,
            });
        });

        toast.success("Uploaded Successfully", {
          id: toastId,
        });
        setLoading(false);
    }
    

  return (
    <DropzoneComponent minSize={0} maxSize={maxSize} onDrop={onDrop}>
  {({getRootProps, getInputProps, isDragActive, isDragReject, fileRejections}) => {
    
    const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].file.size > maxSize;
    return (
    <section className="m-4">
      <div {...getRootProps()}
        className={cn(
            "w-full h-52 flex justify-center items-center p-5 border border-dashed rounded-lg text-center",
            isDragActive ? "bg-[#035FFE] text-white animate-pulse" : "bg-slate-100/50 dark:bg-slate-800/80 text-slate-400"
        )}
        >
        <input {...getInputProps()} />
        {!isDragActive && "Click here or drop a file to upload!"}
        {isDragActive && !isDragReject && "Drop to upload this file!"}
        {isDragReject && "File type is not supported, sorry!"}
        {isFileTooLarge && (
            <div className="text-danger mt-2">File is too large.</div>
        )}
      </div>
    </section>
  )}}
</DropzoneComponent>
  )
}

export default Dropzone