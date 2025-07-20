"use client"

import { useState, useEffect, Fragment } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Menu,
  X,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  User,
  Shield,
  UserCheck,
  FileText,
  TrendingUp,
  Tag,
  Users,
  Truck,
  LayoutGrid,
  Calculator,
  ClipboardList,
} from "lucide-react"
import { Dialog, Transition, Menu as HeadlessMenu } from "@headlessui/react"

// Componente para un solo enlace de navegación
const NavLink = ({ to, children, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
      }`}
    >
      {children}
    </Link>
  )
}

// Componente para un menú desplegable
const NavDropdown = ({ item, closeMobileMenu }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = item.dropdown.some((subItem) => location.pathname === subItem.href)

  const handleNavigate = (href) => {
    closeMobileMenu()
    navigate(href)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-2 pl-6 space-y-1">
          {item.dropdown.map((subItem) => (
            <Link
              key={subItem.name}
              to={subItem.href}
              onClick={() => handleNavigate(subItem.href)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === subItem.href
                  ? "text-white"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <subItem.icon className="w-4 h-4" />
              <span>{subItem.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Cerrar menú móvil en cambio de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Definición de los items de navegación
  const baseNavigationItems = [
    { name: "Ventas", href: "/ventas", icon: ShoppingCart },
    { name: "Cotizaciones", href: "/cotizaciones", icon: ClipboardList }, // NUEVO: Agregar cotizaciones
    { name: "Compras", href: "/compras", icon: Package },
    { name: "Cierre de caja", href: "/cierre-caja", icon: CreditCard },
  ]

  const adminOnlyItems = [
    { name: "Stock", href: "/stock", icon: Package },
    {
      name: "Reportes",
      icon: BarChart3,
      dropdown: [
        { name: "Reporte de compras", href: "/reportes/compras", icon: TrendingUp },
        { name: "Reporte de ventas", href: "/reportes/ventas", icon: FileText },
        { name: "Reporte de presupuestos", href: "/reportes/presupuestos", icon: Calculator },
      ],
    },
    {
      name: "Ajustes",
      icon: Settings,
      dropdown: [
        { name: "Configuraciones", href: "/configuraciones", icon: Settings },
        { name: "Proveedores", href: "/proveedores", icon: Truck },
        { name: "Clientes", href: "/clientes", icon: Users },
        { name: "Categorías", href: "/categorias", icon: Tag },
      ],
    },
  ]

  const navigationItems = user?.rol === "admin" ? [...baseNavigationItems, ...adminOnlyItems] : baseNavigationItems

  return (
    <>
      <nav className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Navegación Desktop */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-md">
                  <LayoutGrid className="h-5 w-5 text-slate-800" />
                </div>
                <span className="text-lg font-bold text-white hidden sm:block">La Solución Repuestos</span>
              </Link>
              {/* Menú Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                {navigationItems.map((item) =>
                  item.dropdown ? (
                    <DesktopDropdown key={item.name} item={item} />
                  ) : (
                    <NavLink key={item.name} to={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  ),
                )}
              </div>
            </div>

            {/* User Dropdown y Menú Móvil */}
            <div className="flex items-center gap-4">
              {/* User Dropdown Desktop */}
              <div className="hidden lg:block">
                <UserDropdown user={user} onLogout={handleLogout} />
              </div>

              {/* Botón Menú Móvil */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-label="Abrir menú principal"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Panel Menú Móvil */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        navigationItems={navigationItems}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}

// Dropdown para la vista de escritorio
const DesktopDropdown = ({ item }) => {
  const location = useLocation()
  const isActive = item.dropdown.some((subItem) => location.pathname === subItem.href)

  return (
    <div className="relative">
      <HeadlessMenu as="div" className="relative">
        <HeadlessMenu.Button
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
          <ChevronDown className="w-4 h-4" />
        </HeadlessMenu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {item.dropdown.map((subItem) => (
                <HeadlessMenu.Item key={subItem.name}>
                  {({ active }) => (
                    <Link
                      to={subItem.href}
                      className={`${
                        active ? "bg-slate-100 text-slate-900" : "text-slate-700"
                      } group flex items-center gap-3 px-4 py-2 text-sm`}
                    >
                      <subItem.icon className="w-4 h-4" />
                      {subItem.name}
                    </Link>
                  )}
                </HeadlessMenu.Item>
              ))}
            </div>
          </HeadlessMenu.Items>
        </Transition>
      </HeadlessMenu>
    </div>
  )
}

// Dropdown de usuario para la vista de escritorio
const UserDropdown = ({ user, onLogout }) => (
  <div className="relative">
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-300 hover:bg-slate-700/50 hover:text-white">
        <User className="w-4 h-4" />
        <span>{user?.nombre}</span>
        <ChevronDown className="w-4 h-4" />
      </HeadlessMenu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm text-slate-900">Conectado como</p>
            <p className="text-sm font-medium text-slate-900 truncate">{user?.nombre}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.rol === "admin" ? (
                <Shield className="w-4 h-4 text-amber-500" />
              ) : (
                <UserCheck className="w-4 h-4 text-sky-500" />
              )}
              <p className="text-xs text-slate-500 capitalize">{user?.rol}</p>
            </div>
          </div>
          <div className="py-1">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? "bg-slate-100 text-slate-900" : "text-slate-700"
                  } group flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm`}
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Cerrar Sesión
                </button>
              )}
            </HeadlessMenu.Item>
          </div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  </div>
)

// Panel lateral para el menú móvil
const MobileMenu = ({ isOpen, setIsOpen, navigationItems, user, onLogout }) => {
  const closeMobileMenu = () => setIsOpen(false)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-slate-800 pb-12 shadow-xl">
              <div className="flex px-4 pt-5 pb-2">
                <button
                  type="button"
                  className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-slate-300"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Cerrar menú</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Links */}
              <div className="mt-2 space-y-2 border-b border-slate-700/50 px-4 pb-3">
                {navigationItems.map((item) =>
                  item.dropdown ? (
                    <NavDropdown key={item.name} item={item} closeMobileMenu={closeMobileMenu} />
                  ) : (
                    <NavLink key={item.name} to={item.href} onClick={closeMobileMenu}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  ),
                )}
              </div>

              <div className="space-y-6 border-t border-slate-700/50 px-4 py-6">
                <div className="flow-root">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user?.nombre}</p>
                      <p className="text-sm text-slate-400 capitalize">{user?.rol}</p>
                    </div>
                  </div>
                </div>
                <div className="flow-root">
                  <button
                    onClick={onLogout}
                    className="-m-2 block p-2 font-medium text-red-400 hover:text-red-300 w-full text-left flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Navbar
