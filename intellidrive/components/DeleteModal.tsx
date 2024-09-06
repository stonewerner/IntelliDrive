'use client'

import React from 'react'
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/store/store";
import { useUser } from '@clerk/nextjs'
import { deleteObject, ref } from 'firebase/storage'
import { db, storage } from '@/firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import toast, { Toaster } from 'react-hot-toast';
import { useFileOperations } from './FileOperations'

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

    async function handleDelete() {
      if (!fileId) return;
      const toastId = toast.loading("Deleting...");
  
      try {
        await deleteFile(fileId, isPersonal);
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
            This action cannot be undone. This will permanently delete your file!
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
  )
}
