"use client";

import React from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/store";
import { useUser, useOrganization } from "@clerk/nextjs";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useFileOperations } from "./FileOperations";

interface DeleteModalProps {
    isPersonal: boolean;
}

export function DeleteModal({ isPersonal }: DeleteModalProps) {
    const { user } = useUser();
    const [isDeleteModalOpen, setIsDeleteModalOpen, fileId, setFileId] =
        useAppStore((state) => [
            state.isDeleteModalOpen,
            state.setIsDeleteModalOpen,
            state.fileId,
            state.setFileId,
        ]);

    const { deleteFile } = useFileOperations();
    const { organization } = useOrganization();

    async function handleDelete() {
        if (!fileId) return;
        if (!user) {
            toast.error("User not authenticated. Please log in and try again.");
            return;
        }
        const toastId = toast.loading("Deleting...");

        try {
            // Get the document reference to fetch the Ragie document_id
            const collectionPath = isPersonal
                ? `users/${user.id}/files`
                : `organizations/${organization?.id}/files`;

            const docRef = doc(db, collectionPath, fileId);
            const docSnap = await getDoc(docRef);
            const ragieDocumentId = docSnap.data()?.ragieDocumentId;

            // Delete from Firebase
            await deleteFile(fileId, isPersonal);

            // Delete from Ragie if document_id exists
            if (ragieDocumentId) {
                const response = await fetch("/api/ragie/delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ documentId: ragieDocumentId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to delete from Ragie");
                }
            }

            toast.success("Deleted Successfully", {
                id: toastId,
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Error deleting file", {
                id: toastId,
            });
        } finally {
            setIsDeleteModalOpen(false);
            setFileId("");
        }
    }

    return (
        <Dialog
            open={isDeleteModalOpen}
            onOpenChange={(isOpen) => {
                setIsDeleteModalOpen(isOpen);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your file!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-2 py-3">
                    <Button
                        size="sm"
                        className="px-3 flex-1"
                        variant={"ghost"}
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <span className="sr-only">Cancel</span>
                        <span>Cancel</span>
                    </Button>

                    <Button
                        type="submit"
                        size="sm"
                        className="px-3 flex-1"
                        variant={"destructive"}
                        onClick={handleDelete}
                    >
                        <span className="sr-only">Delete</span>
                        <span>Delete</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
