"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff, User, Lock, Car, UserPlus, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register: registerUser, loading, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nombre: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (data) => {
    try {
      clearErrors()
      const result = await registerUser({
        nombre: data.nombre,
        password: data.password,
      })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (error) {
      console.error("Error en registro:", error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="bg-white border border-slate-200 shadow-xl max-w-md w-full rounded-xl">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">¡Registro Exitoso!</h2>
            <p className="text-slate-600 mb-4 text-base">Tu cuenta ha sido creada correctamente.</p>
            <p className="text-sm text-slate-500 font-medium">Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold text-slate-900">Crear Cuenta</CardTitle>
            <CardDescription className="text-slate-600 text-base">Regístrate para acceder al sistema</CardDescription>
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
                        value: 3,
                        message: "El usuario debe tener al menos 3 caracteres",
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
                    autoComplete="new-password"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 6,
                        message: "La contraseña debe tener al menos 6 caracteres",
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

              {/* Campo Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: "Confirma tu contraseña",
                      validate: (value) => value === password || "Las contraseñas no coinciden",
                    })}
                    className="pl-12 pr-12 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg font-medium"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
                )}
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
                    Registrando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Crear Cuenta
                  </div>
                )}
              </Button>
            </form>

            {/* Link a login */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  to="/login"
                  className="text-slate-800 hover:text-slate-600 font-semibold transition-colors underline decoration-2 underline-offset-2"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
