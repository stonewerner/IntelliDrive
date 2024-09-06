import { db, storage } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useUser, useOrganization } from "@clerk/nextjs";

export const useFileOperations = () => {
  const { user } = useUser();
  const { organization } = useOrganization();

  const getCollectionPath = (isPersonal: boolean) => {
    return isPersonal ? `users/${user?.id}/files` : `organizations/${organization?.id}/files`;
  };

  const renameFile = async (fileId: string, newFilename: string, isPersonal: boolean) => {
    if (!user) return;
    const collectionPath = getCollectionPath(isPersonal);
    await updateDoc(doc(db, collectionPath, fileId), {
      filename: newFilename,
    });
  };

  const deleteFile = async (fileId: string, isPersonal: boolean) => {
    if (!user) return;
    const collectionPath = getCollectionPath(isPersonal);
    await deleteDoc(doc(db, collectionPath, fileId));
    const fileRef = ref(storage, `${isPersonal ? `users/${user.id}` : `organizations/${organization?.id}`}/files/${fileId}`);
    await deleteObject(fileRef);
  };

  return { renameFile, deleteFile };
};