"use client"

import Navbar from "./NavBar"

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-300">
      <Navbar />
      <main className="bg-gray-50/50">{children}</main>
    </div>
  )
}

export default Layout
