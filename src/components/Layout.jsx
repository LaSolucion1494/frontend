"use client"

import Navbar from "./Navbar"

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-300">
      <Navbar />
      <main className="bg-slate-300">{children}</main>
    </div>
  )
}

export default Layout
