'use client'
import React from 'react';
import { useOrganizationList } from '@clerk/clerk-react'
import {  useUser } from "@clerk/nextjs";
import { OrganizationSwitcher } from "@clerk/nextjs";

const OrganizationSwitcherComponent: React.FC = () => {
  const { organization, isLoaded } = useOrganizationList();
  const { user } = useUser();

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <OrganizationSwitcher
      hidePersonal
      appearance={{
        elements: {
          rootBox: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            margin: '20px 0',
          },
          organizationSwitcherTrigger: {
            padding: '12px',
            backgroundColor: '#f0f0f0',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          },
        },
      }}
    />
  );
};

export default OrganizationSwitcherComponent;
