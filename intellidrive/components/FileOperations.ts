import { db, storage } from "@/firebase";
import { DocumentData, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useUser, useOrganization } from "@clerk/nextjs";

export const useFileOperations = (isPersonal: boolean) => {
  const { user } = useUser();
  const { organization } = useOrganization();

  const getCollectionPath = () => {
    return isPersonal ? `users/${user?.id}/files` : `organizations/${organization?.id}/files`;
  };

  const renameFile = async (id: string, filename: string) => {
    const collectionPath = getCollectionPath();
    await updateDoc(doc(db, collectionPath, id), {
      filename: filename,
    });
  };

  const deleteFile = async (id: string) => {
    const collectionPath = getCollectionPath();
    await deleteDoc(doc(db, collectionPath, id));
    const fileRef = ref(storage, `${isPersonal ? `users/${user?.id}` : `organizations/${organization?.id}`}/${id}`);
    await deleteObject(fileRef);
  };

  const downloadFile = (downloadURL: string) => {
    window.open(downloadURL, '_blank');
  };

  return { renameFile, deleteFile, downloadFile };
};