import { auth, clerkClient } from '@clerk/nextjs/server'
import { getDocs, collection } from "firebase/firestore";
import { db } from '@/firebase';
import { FileType } from '@/typings';
import DashboardClient from './DashboardClient';

async function DashboardServer() {
  const { userId, orgId } = auth();

  const fetchFiles = async (isPersonal: boolean) => {
    if (!userId && !orgId) return [];

    const collectionPath = isPersonal ? `users/${userId}/files` : `organizations/${orgId}/files`;
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

  const personalFiles = await fetchFiles(true);
  const organizationFiles = orgId ? await fetchFiles(false) : [];

  const user = userId ? await clerkClient.users.getUser(userId) : null;

  return <DashboardClient personalFiles={personalFiles} organizationFiles={organizationFiles} userId={userId} orgId={orgId} />;
}

export default DashboardServer;