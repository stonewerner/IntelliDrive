import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteOrganizationVectors } from "@/utils/pinecone/deleteOrganizationVectors";
import { db } from "@/firebase";
import { deleteDoc, doc } from "firebase/firestore";


// Call this when an organization is deleted in Clerk (webhooks?)
export async function POST(req: NextRequest) {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Delete vectors from Pinecone
        await deleteOrganizationVectors(orgId);

        // Delete organization documents from Firebase
        const orgDocRef = doc(db, `organizations/${orgId}`);
        await deleteDoc(orgDocRef);

        // You might want to add more cleanup here, such as:
        // - Deleting all files associated with the organization from Firebase Storage
        // - Removing organization references from user documents
        // - Any other necessary cleanup tasks

        return NextResponse.json({ message: "Organization deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting organization:", error);
        return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
    }
}