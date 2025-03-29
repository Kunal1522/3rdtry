import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FetchCodeforces from './fetchData'

import CodeforcesProblemFetcher from './fetchThemecp'
import { Toaster } from "react-hot-toast";
import XPDisplay from './xpbar'

function App() {
  return (
   
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col items-center">
    <Toaster position="top-right" reverseOrder={false} />
      <header className="w-full bg-gray-700 py-4 shadow-md">
      <FetchCodeforces handle={"sikki_pehlwan"}/>
        <h1 className="text-center text-3xl font-bold">Codeforces Practice</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-semibold mb-4">Welcome to the XP Level System</h2>
        <XPDisplay handle={"sikki_pehlwan"} />
      </main>
      <footer className="w-full bg-gray-700 py-2 text-center text-sm">
        <p>© 2023 Codeforces Practice. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
