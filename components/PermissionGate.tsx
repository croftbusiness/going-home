'use client';

import { ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface PermissionGateProps {
  permission: boolean;
  children: ReactNode;
  sectionName?: string;
}

export default function PermissionGate({ permission, children, sectionName }: PermissionGateProps) {
  if (!permission) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#FCFAF7] rounded-lg p-8 shadow-sm border border-gray-200 text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#2C2A29] mb-2">
            Access Denied
          </h2>
          <p className="text-[#2C2A29] opacity-70">
            {sectionName 
              ? `You do not have permission to view ${sectionName}.`
              : 'You do not have permission to view this content.'
            }
          </p>
          <p className="text-sm text-[#2C2A29] opacity-60 mt-4">
            Contact the account owner to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


