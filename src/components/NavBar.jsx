"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Car,
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
} from "lucide-react"
import { Button } from "./ui/button"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const navDropdownRef = useRef(null)
  const userDropdownRef = useRef(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        if (activeDropdown !== "user") {
          setActiveDropdown(null)
        }
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        if (activeDropdown === "user") {
          setActiveDropdown(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [activeDropdown])

  // Agregar este useEffect después del useEffect existente de handleClickOutside
  useEffect(() => {
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }

  const toggleDropdown = (dropdownName) => {
    console.log("Toggle dropdown:", dropdownName, "Estado actual:", activeDropdown)
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
  }

  // Reemplazar la función closeAllMenus existente:
  const closeAllMenus = () => {
    console.log("Cerrando todos los menús")
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }

  // Reemplazar la función handleDropdownNavigation existente con esta versión mejorada:
  const handleDropdownNavigation = (href, event) => {
    event.preventDefault()
    event.stopPropagation()
    console.log("Navegando a:", href)

    // Resetear estados inmediatamente
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)

    // Navegar después de un pequeño delay para asegurar que los estados se actualicen
    setTimeout(() => {
      navigate(href)
    }, 50)
  }

  // Elementos de navegación base para empleados
  const baseNavigationItems = [
    {
      name: "Ventas",
      href: "/ventas",
      icon: ShoppingCart,
    },
    {
      name: "Compras",
      href: "/compras",
      icon: Package,
    },
    {
      name: "Cierre de caja",
      href: "/cierre-caja",
      icon: CreditCard,
    },
  ]

  // Elementos adicionales solo para administradores
  const adminOnlyItems = [
    {
      name: "Stock",
      href: "/stock",
      icon: Package,
    },
    {
      name: "Reportes",
      icon: BarChart3,
      dropdown: [
        { name: "Reporte de compras", href: "/reportes/compras", icon: TrendingUp },
        { name: "Reporte de ventas", href: "/reportes/ventas", icon: FileText },
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

  // Combinar elementos según el rol del usuario
  const navigationItems = user?.rol === "admin" ? [...baseNavigationItems, ...adminOnlyItems] : baseNavigationItems

  const isActiveLink = (href) => {
    return location.pathname === href
  }

  const isActiveDropdown = (dropdown) => {
    return dropdown.some((item) => location.pathname === item.href)
  }

  return (
    <nav className="sticky top-0 z-20 bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre de la empresa */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link to="/dashboard" className="flex items-center" onClick={closeAllMenus}>
              <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-lg border border-slate-600 flex-shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg font-bold text-white truncate">La Solución Repuestos</h1>
              </div>
            </Link>
          </div>

          {/* Área derecha: Navegación + Usuario */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Navegación desktop */}
            <div className="flex items-center" ref={navDropdownRef}>
              <div className="flex items-center space-x-2">
                {navigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.dropdown ? (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDropdown(item.name)
                          }}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            isActiveDropdown(item.dropdown)
                              ? "bg-slate-700 text-white"
                              : "text-slate-300 hover:text-white hover:bg-slate-700"
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="hidden xl:inline">{item.name}</span>
                          <ChevronDown
                            className={`w-4 h-4 ml-1 transition-transform duration-200 flex-shrink-0 ${
                              activeDropdown === item.name ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown menu */}
                        {activeDropdown === item.name && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[60]">
                            {item.dropdown.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={(e) => handleDropdownNavigation(subItem.href, e)}
                                className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 text-left hover:bg-slate-50 ${
                                  isActiveLink(subItem.href)
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-700 hover:text-slate-900"
                                }`}
                              >
                                <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                                {subItem.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={closeAllMenus}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          isActiveLink(item.href)
                            ? "bg-slate-700 text-white"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="hidden xl:inline">{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Información del usuario desktop */}
            <div className="flex items-center flex-shrink-0 relative" ref={userDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDropdown("user")
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-700 transition-all duration-200 border border-slate-600 hover:border-slate-500"
              >
                <User className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="font-medium">{user?.nombre}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    activeDropdown === "user" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown menu */}
              {activeDropdown === "user" && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[60]">
                  {/* Información del rol */}
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      {user?.rol === "admin" ? (
                        <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user?.nombre}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {user?.rol === "admin" ? "Administrador" : "Empleado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opción cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botón menú móvil */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800 border-t border-slate-700">
              {/* Información del usuario móvil */}
              <div className="px-3 py-3 border-b border-slate-700 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-slate-300" />
                      <span className="text-white font-medium">{user?.nombre}</span>
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-slate-700 rounded border border-slate-600">
                      {user?.rol === "admin" ? (
                        <Shield className="w-3 h-3 text-yellow-400" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-blue-400" />
                      )}
                      <span className="text-xs text-white capitalize">{user?.rol}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enlaces de navegación móvil */}
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      {/* En la sección de menú móvil, reemplazar el botón del dropdown con: */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleDropdown(item.name)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          isActiveDropdown(item.dropdown)
                            ? "bg-slate-700 text-white"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Subopciones móvil - CORREGIDO */}
                      {activeDropdown === item.name && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <button
                              key={subItem.name}
                              onClick={(e) => handleDropdownNavigation(subItem.href, e)}
                              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 text-left ${
                                isActiveLink(subItem.href)
                                  ? "bg-slate-700 text-white"
                                  : "text-slate-300 hover:text-white hover:bg-slate-700"
                              }`}
                            >
                              <subItem.icon className="w-4 h-4 mr-3" />
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={closeAllMenus}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActiveLink(item.href)
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Botón cerrar sesión móvil */}
              <div className="pt-2 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
