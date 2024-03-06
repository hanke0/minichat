import { Main } from '@/components/main';
import React from 'react';
import Link from 'next/link';


export function ErrorPage({ error }: { error?: Error | string }) {
  return (
    <Main>
      <div className="h-full flex flex-col items-center justify-start">
        <h1 className="basis-1 text-center text-3xl py-16 text-red-400">Error</h1>
        <p className="basis-1 text-center text-sm pb-8 text-gray-600 dark:text-slate-300">{error?.toString() || 'Something went wrong'}</p>
        <div className="basis-1 text-2xl font-bold text-center pb-4 flex divide-x">
          <Link className="block px-4" href="/">Go to Home</Link>
          <Link className="block px-4" href="/" onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          >Read Page
          </Link>
        </div>
      </div>
    </Main>
  )
}
