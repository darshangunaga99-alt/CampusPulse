import React from 'react';
import { Outlet } from 'react-router-dom';
import { StitchHeader } from './StitchHeader';
import { StitchSidebar } from './StitchSidebar';

export const StitchLayout: React.FC = () => {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <StitchHeader />
      <StitchSidebar />
      <div className="pl-72">
        <main className="w-full min-h-screen pt-16 px-space-lg pb-space-2xl bg-surface">
          <div className="flex flex-col w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

