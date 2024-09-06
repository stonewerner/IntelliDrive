'use client'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAppStore } from '@/store/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { useFileOperations } from './FileOperations';

interface RenameModalProps {
    isPersonal: boolean;
  }

function RenameModal({ isPersonal }: RenameModalProps) {
    const { user } = useUser();
    const [input, setInput] = useState("");
    const [isRenameModalOpen, setIsRenameModalOpen, fileId, filename] =
        useAppStore((state) => [
            state.isRenameModalOpen,
            state.setIsRenameModalOpen,
            state.fileId,
            state.filename,
        ]);
    
        const { renameFile } = useFileOperations();

        const handleRename = async () => {
          if (!fileId) return;
      
          const toastId = toast.loading("Renaming...");
      
          try {
            await renameFile(fileId, input, isPersonal);
            toast.success("Renamed Successfully", {
              id: toastId,
            });
            setInput("");
            setIsRenameModalOpen(false);
          } catch (error) {
            console.error("Error renaming file:", error);
            toast.error("Error renaming file", {
              id: toastId,
            });
          }
        };

        await updateDoc(doc(db, "users", user.id, "files", fileId), {
            filename: input,
        });
        toast.success("Renamed Successfully", {
            id: toastId,
        });
        setInput("");
        setIsRenameModalOpen(false);
    };

    return (
        <Dialog
            open={isRenameModalOpen}
            onOpenChange={(isOpen) => {
                setIsRenameModalOpen(isOpen);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="pb-2">Rename the File</DialogTitle>

                    <Input
                        id="link"
                        defaultValue={filename}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDownCapture={(e) => {
                            if (e.key === "Enter") {
                                handleRename();
                            }
                        }}
                    />

                    <div className="flex justify-end space-x-2 py-3">
                        <Button
                            size="sm"
                            className="px-3"
                            variant={"ghost"}
                            onClick={() => setIsRenameModalOpen(false)}
                        >
                            <span className="sr-only">Cancel</span>
                            <span>Cancel</span>
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3"
                            onClick={handleRename}
                        >
                            <span className="sr-only">Rename</span>
                            <span>Rename</span>
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export default RenameModal;
