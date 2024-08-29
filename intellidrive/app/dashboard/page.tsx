import React from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Dropzone from '@/components/Dropzone'
import { getDocs, collection } from "firebase/firestore";
import { db } from '@/firebase';
import { FileType } from '@/typings';
import TableWrapper from '@/components/table/TableWrapper';
import OrganizationSwitcherComponent from '@/components/OrganizationSwitcher';
//import JoinedOrganizations from '@/components/JoinedOrganizations';

async function Dashboard() {
  const {userId, orgId} = auth();

  let skeletonFiles: FileType[] = [];

  if (orgId) {
    const docsResults = await getDocs(collection(db, "organizations", orgId, "files"));
    skeletonFiles = docsResults.docs.map(doc => ({
      id: doc.id,
      filename: doc.data().filename || doc.id,
      timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
      fullName: doc.data().fullName,
      downloadURL: doc.data().downloadURL,
      type: doc.data().type,
      size: doc.data().size,
    }));
  } else if (userId) {
    const docsResults = await getDocs(collection(db, "users", userId!, "files"));
    skeletonFiles = docsResults.docs.map(doc => ({
      id: doc.id,
      filename: doc.data().filename || doc.id,
      timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
      fullName: doc.data().fullName,
      downloadURL: doc.data().downloadURL,
      type: doc.data().type,
      size: doc.data().size,
    }));
  }

  const user = userId ? await clerkClient.users.getUser(userId) : null;


  return (
    <div className="border-t">
      <Dropzone />

      <section className="container space-y-5">
        <h2 className="font-bold">All Files</h2>
        <OrganizationSwitcherComponent />
        <div>
          <TableWrapper skeletonFiles={skeletonFiles} />
        </div>
      </section>

    </div>
  )
}

export default Dashboard