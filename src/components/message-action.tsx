import React from 'react';

export function MessageAction(
  { children }: { children: React.ReactNode }
) {
  return (
    <div className="rounded-lg border bg-gray-100 dark:bg-gray-800 py-1 px-4 mr-2">
      {children}
    </div>
  )
}
