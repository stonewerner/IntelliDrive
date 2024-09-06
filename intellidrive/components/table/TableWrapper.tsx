"use client"
import React, {useState, useEffect} from 'react'
import { FileType } from "@/typings";
import { Button } from '../ui/button';
import { DataTable } from "./Table";
import { columns } from "./columns";
import { useUser, useOrganization } from '@clerk/nextjs';
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { Skeleton } from "@/components/ui/skeleton"
import { useFileOperations } from '../FileOperations';

interface TableWrapperProps {
  skeletonFiles: FileType[];
  isPersonal: boolean;
}



function TableWrapper({ skeletonFiles, isPersonal }: TableWrapperProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [initialFiles, setInitialFiles] = useState<FileType[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const [docs, loading, error] = useCollection(
    (user && isPersonal) || (organization && !isPersonal)
      ? query(
          collection(
            db, 
            isPersonal 
              ? `users/${user?.id}/files` 
              : `organizations/${organization?.id}/files`
          ),
          orderBy("timestamp", sort)
        )
      : null
  );

  useEffect(() => {
    if (!docs) return;

    const files = docs.docs.map(doc => ({
      id: doc.id,
      filename: doc.data().filename || doc.id,
      timestamp: new Date(doc.data().timestamp?.seconds* 1000) || undefined,
      fullName: doc.data().fullName,
      downloadURL: doc.data().downloadURL,
      type: doc.data().type,
      size: doc.data().size,
    }));

    setInitialFiles(files)
  }, [docs])

  if (!user && isPersonal) {
    return <div>Error: User data not available</div>;
  }

  if (!organization && !isPersonal) {
    return <div>Error: Organization data not available</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (docs?.docs.length === undefined)
    return (
      <div className="flex flex-col">
        <Button variant={"outline"} className="ml-auto w-36 h-10 mb-5">
          <Skeleton className="h-5 w-full" />
        </Button>
        <div className="border rounded-lg">
          <div className="border-b h-12" />
          {skeletonFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-4 p-5 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>

          ))}
          {/* If no files are uploaded */}
          {skeletonFiles.length === 0 && (
            <div className="flex items-center space-x-4 p-5 w-full">
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
        </div>
      </div>
    );

    

  return (
    <div className="flex flex-col space-y-5 pb-10">
      <Button
        className="ml-auto w-fit"
        variant={"outline"}
        onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
      >Sort By {sort === "desc" ? "Newest" : "Oldest"}</Button>

      <DataTable columns={columns} data={initialFiles} isPersonal={isPersonal} />

    </div>
  )
}

export default TableWrapper;