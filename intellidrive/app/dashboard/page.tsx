/*'use client'
import React, { useState } from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Dropzone from '@/components/Dropzone'
import { getDocs, collection } from "firebase/firestore";
import { db } from '@/firebase';
import { FileType } from '@/typings';
import TableWrapper from '@/components/table/TableWrapper';
import OrganizationSwitcherComponent from '@/components/OrganizationSwitcher';
import { useOrganization } from '@clerk/nextjs';
import DashboardToggler from '@/components/DashboardToggler';
//import JoinedOrganizations from '@/components/JoinedOrganizations';

async function Dashboard() {
  const {userId, orgId} = auth();
  const {organization} = useOrganization();
  const [isPersonal, setIsPersonal] = useState(true);

  //let skeletonFiles: FileType[] = [];

  const fetchFiles = async (isPersonal: boolean) => {
    if (!userId && !organization?.id) return [];

    const collectionPath = isPersonal ? `users/${userId}/files` : `organizations/${organization?.id}/files`;
    const docsResults = await getDocs(collection(db, collectionPath));

    return docsResults.docs.map(doc => ({
      id: doc.id,
      filename: doc.data().filename || doc.id,
      timestamp: new Date(doc.data().timestamp?.seconds * 1000) || undefined,
      fullName: doc.data().fullName,
      downloadURL: doc.data().downloadURL,
      type: doc.data().type,
      size: doc.data().size,
    }));
  };

  const files = await fetchFiles(isPersonal);

  /*if (orgId) {
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
  }*/
/*
  const user = userId ? await clerkClient.users.getUser(userId) : null;


  return (
    <div className="border-t">
      <DashboardToggler isPersonal={isPersonal} onToggle={setIsPersonal} />
      <Dropzone isPersonal={isPersonal} />

      <section className="container space-y-5">
      <h2 className="font-bold">{isPersonal ? "Personal Files" : "Organization Files"}</h2>
        {/*<OrganizationSwitcherComponent />*/
        /*<div>
          <TableWrapper skeletonFiles={files} isPersonal={isPersonal} />
        </div>
      </section>
    </div>
  )
}

export default Dashboard*/

import DashboardServer from './DashboardServer';

export default function DashboardPage() {
  return <DashboardServer />;
}