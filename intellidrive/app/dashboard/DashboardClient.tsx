'use client'

import React, { useState } from 'react'
import Dropzone from '@/components/Dropzone'
import { FileType } from '@/typings';
import TableWrapper from '@/components/table/TableWrapper';
import DashboardToggler from '@/components/DashboardToggler';
import { useOrganization } from '@clerk/nextjs';

interface DashboardClientProps {
  personalFiles: FileType[];
  organizationFiles: FileType[];
  userId: string | null;
  orgId: string | null;
}

function DashboardClient({ personalFiles, organizationFiles, userId, orgId }: DashboardClientProps) {
  const [isPersonal, setIsPersonal] = useState(true);
  const { organization } = useOrganization();

  const files = isPersonal ? personalFiles : organizationFiles;

  return (
    <div className="border-t">
      <Dropzone isPersonal={isPersonal} />
      

      <section className="container space-y-5">
        <h2 className="font-bold">{isPersonal ? "Personal Files" : "Organization Files"}</h2>
        <div>
        <DashboardToggler isPersonal={isPersonal} onToggle={setIsPersonal} />
          <TableWrapper skeletonFiles={files} isPersonal={isPersonal} />
        </div>
      </section>
    </div>
  )
}

export default DashboardClient;