import React from 'react'
import { FileType } from "@/typings";
import { Button } from '../ui/button';
import { DataTable } from "./Table";
import { columns } from "./columns";


function TableWrapper({ skeletonFiles }: { skeletonFiles: FileType[] }) {
  return (
    <div>
      <Button>Sort By...</Button>

      <DataTable columns={columns} data={skeletonFiles} />

    </div>
  )
}

export default TableWrapper;