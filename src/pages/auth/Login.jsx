"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff, User, Lock, Car, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nombre: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    try {
      clearErrors()
      const result = await login(data)
      if (result.success) {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Error en login:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">La Solución Repuestos S.A.S</h1>
        </div>

        {/* Formulario */}
        <Card className="bg-white border border-slate-200 shadow-xl rounded-xl">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-slate-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-600 text-base">Accede a tu cuenta para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Mostrar error si existe */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Campo Usuario */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-slate-700 font-semibold text-sm">
                  Usuario
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="nombre"
                    type="text"
                    autoComplete="username"
                    {...register("nombre", {
                      required: "El usuario es obligatorio",
                      minLength: {
                        value: 1,
                        message: "El usuario no puede estar vacío",
                      },
                    })}
                    className="pl-12 pr-4 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg font-medium"
                    placeholder="Ingresa tu usuario"
                  />
                </div>
                {errors.nombre && <p className="text-sm text-red-600 font-medium">{errors.nombre.message}</p>}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 1,
                        message: "La contraseña no puede estar vacía",
                      },
                    })}
                    className="pl-12 pr-12 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg font-medium"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>}
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Link a registro */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/register"
                  className="text-slate-800 hover:text-slate-600 font-semibold transition-colors underline decoration-2 underline-offset-2"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
