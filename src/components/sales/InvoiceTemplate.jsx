"use client"

import { forwardRef } from "react"

const InvoiceTemplate = forwardRef(({ saleData, config, tipoFactura = "B" }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCUIT = (cuit) => {
    if (!cuit) return "-"
    const cleaned = cuit.replace(/\D/g, "")
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`
    }
    return cuit || "-"
  }

  // CORREGIDO: Usar datos de empresa guardados al momento de la venta
  const empresaDatos = saleData?.empresa_datos || {}
  const numeroFactura = saleData?.numero_factura || saleData?.numeroFactura || "SIN-NUMERO"

  // Función para mostrar dato o línea
  const displayValue = (value, defaultValue = "-") => {
    return value && value.trim() !== "" ? value : defaultValue
  }

  // Calcular subtotales para Factura A
  const calculateSubtotals = () => {
    const subtotal = saleData?.subtotal || 0
    const descuento = saleData?.descuento || 0
    const interes = saleData?.interes || 0

    if (tipoFactura === "A") {
      // Para Factura A, usar los datos de IVA e ingresos brutos guardados al momento de la venta
      const ivaRate = Number.parseFloat(empresaDatos.iva || 21) / 100
      const ibRate = Number.parseFloat(empresaDatos.ingresos_brutos || 0) / 100

      // Calcular base imponible (sin IVA ni IB)
      const baseImponible = subtotal / ((1 + ivaRate) * (1 + ibRate))
      const montoIVA = baseImponible * ivaRate
      const montoIB = baseImponible * ibRate

      return {
        netoGravado: baseImponible,
        noGravado: 0,
        exento: 0,
        montoIVA: montoIVA,
        montoIB: montoIB,
        subtotalSinImpuestos: baseImponible,
        total: subtotal + interes - descuento,
      }
    } else {
      // Para Factura B, todo está incluido
      return {
        netoGravado: 0,
        noGravado: subtotal,
        exento: 0,
        montoIVA: 0,
        montoIB: 0,
        subtotalSinImpuestos: subtotal,
        total: subtotal + interes - descuento,
      }
    }
  }

  const subtotals = calculateSubtotals()

  // Verificar que tenemos datos válidos antes de renderizar
  if (!saleData) {
    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto text-sm font-mono">
        <div className="text-center text-red-600">
          <p>Error: No se pudieron cargar los datos de la factura</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto text-sm font-mono">
      {/* Header */}
      <div className="border-2 border-black mb-6">
        <div className="flex">
          {/* Logo y datos empresa */}
          <div className="flex-1 p-4 border-r-2 border-black">
            <div className="text-lg font-bold mb-2">{displayValue(empresaDatos.nombre, "LA SOLUCIÓN REPUESTOS")}</div>
            <div className="text-xs space-y-1">
              <div>Razón Social: {displayValue(empresaDatos.nombre, "La Solución Repuestos S.A.")}</div>
              <div>Domicilio Comercial: {displayValue(empresaDatos.direccion, "-")}</div>
              <div>Teléfonos: {displayValue(empresaDatos.telefono, "-")}</div>
              <div>Email: {displayValue(empresaDatos.email, "-")}</div>
              <div>Condición frente al IVA: {displayValue(empresaDatos.condicion_iva, "RESPONSABLE INSCRIPTO")}</div>
              <div>CUIT: {formatCUIT(empresaDatos.cuit)}</div>
            </div>
          </div>

          {/* Tipo de factura */}
          <div className="w-24 p-4 text-center border-r-2 border-black">
            <div className="text-xs mb-2">ORIGINAL</div>
            <div className="text-4xl font-bold border-2 border-black p-2">{tipoFactura}</div>
            <div className="text-lg font-bold mt-2">FACTURA</div>
          </div>

          {/* Número y fecha */}
          <div className="flex-1 p-4">
            <div className="text-xs space-y-1">
              <div>
                Número: <span className="font-bold">{numeroFactura}</span>
              </div>
              <div>
                Fecha de Emisión: <span className="font-bold">{formatDate(saleData.fecha_venta)}</span>
              </div>
              <div>Fecha de Inicio de Actividades: {displayValue(empresaDatos.inicio_actividades, "01/05/1998")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="border-2 border-black mb-6 p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div>CUIT: {formatCUIT(saleData.cliente_cuit)}</div>
            <div>
              Apellido y Nombre / Razón Social:{" "}
              <span className="font-bold">{displayValue(saleData.cliente_nombre)}</span>
            </div>
            <div>Domicilio Comercial: {displayValue(saleData.cliente_direccion)}</div>
            <div>Condición frente al IVA: {tipoFactura === "A" ? "RESPONSABLE INSCRIPTO" : "CONSUMIDOR FINAL"}</div>
          </div>
          <div>
            <div>Condición de Venta: {saleData.tiene_cuenta_corriente ? "CUENTA CORRIENTE" : "CONTADO"}</div>
            <div>Teléfono: {displayValue(saleData.cliente_telefono)}</div>
            <div>Email: {displayValue(saleData.cliente_email)}</div>
            <div>Vendedor: {displayValue(saleData.usuario_nombre, "Sin asignar")}</div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {saleData.observaciones && (
        <div className="border-2 border-black mb-4 p-2">
          <div className="text-xs">
            <strong>Observaciones:</strong> {saleData.observaciones}
          </div>
        </div>
      )}

      {/* Detalle de productos */}
      <div className="border-2 border-black mb-6">
        <table className="w-full text-xs">
          <colgroup>
            <col style={{ width: "10%" }} /> {/* Cantidad */}
            <col style={{ width: "50%" }} /> {/* Producto - Columna más ancha */}
            <col style={{ width: "15%" }} /> {/* Precio Unit. */}
            <col style={{ width: "10%" }} /> {/* % Bonif */}
            <col style={{ width: "15%" }} /> {/* Total */}
          </colgroup>
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left p-2 border-r border-black">Cantidad</th>
              <th className="text-left p-2 border-r border-black">Producto</th>
              <th className="text-right p-2 border-r border-black">Precio Unit.</th>
              <th className="text-right p-2 border-r border-black">% Bonif</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {saleData.detalles?.map((detalle, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="p-2 border-r border-black text-center">{detalle.cantidad}</td>
                <td className="p-2 border-r border-black">
                  <div className="truncate">
                    {displayValue(detalle.producto_codigo)} - {displayValue(detalle.producto_nombre)}
                  </div>
                </td>
                <td className="p-2 border-r border-black text-right">{formatCurrency(detalle.precio_unitario)}</td>
                <td className="p-2 border-r border-black text-right">
                  {typeof detalle.discount_percentage === "number"
                    ? detalle.discount_percentage.toFixed(2)
                    : (Number.parseFloat(detalle.discount_percentage) || 0).toFixed(2)}
                </td>
                <td className="p-2 text-right">{formatCurrency(detalle.subtotal)}</td>
              </tr>
            ))}
            {/* Líneas vacías para completar el espacio */}
            {Array.from({ length: Math.max(0, 8 - (saleData.detalles?.length || 0)) }).map((_, index) => (
              <tr key={`empty-${index}`} className="border-b border-gray-300">
                <td className="p-2 border-r border-black">&nbsp;</td>
                <td className="p-2 border-r border-black">&nbsp;</td>
                <td className="p-2 border-r border-black">&nbsp;</td>
                <td className="p-2 border-r border-black">&nbsp;</td>
                <td className="p-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con totales */}
      <div className="flex">
        {/* Información de pago */}
        <div className="flex-1 pr-4">
          <div className="text-xs">
            <div className="mb-2">
              <strong>Recibí(mos):</strong> {formatCurrency(saleData.total)}
            </div>
            <div className="mb-2">
              <strong>Métodos de pago:</strong>
            </div>
            {saleData.pagos?.map((pago, index) => (
              <div key={index} className="ml-4">
                • {pago.tipo_pago}: {formatCurrency(pago.monto)}
              </div>
            ))}
            <div className="mt-4 text-xs">
              Controle su mercadería antes de retirarse y conforme la factura
              <br />
              No se aceptan devoluciones
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="border-2 border-black p-4 min-w-[300px]">
          <table className="w-full text-xs">
            <tbody>
              {tipoFactura === "A" ? (
                <>
                  <tr>
                    <td className="text-right pr-4">Neto Gravado</td>
                    <td className="text-right font-bold">{formatCurrency(subtotals.netoGravado)}</td>
                  </tr>
                  <tr>
                    <td className="text-right pr-4">No Gravado</td>
                    <td className="text-right font-bold">{formatCurrency(subtotals.noGravado)}</td>
                  </tr>
                  <tr>
                    <td className="text-right pr-4">IVA {displayValue(empresaDatos.iva, "21")}%</td>
                    <td className="text-right font-bold">{formatCurrency(subtotals.montoIVA)}</td>
                  </tr>
                  {Number.parseFloat(empresaDatos.ingresos_brutos || 0) > 0 && (
                    <tr>
                      <td className="text-right pr-4">Perc. IIBB {empresaDatos.ingresos_brutos}%</td>
                      <td className="text-right font-bold">{formatCurrency(subtotals.montoIB)}</td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td className="text-right pr-4">Subtotal</td>
                  <td className="text-right font-bold">{formatCurrency(saleData.subtotal)}</td>
                </tr>
              )}

              {saleData.descuento > 0 && (
                <tr>
                  <td className="text-right pr-4">Descuento</td>
                  <td className="text-right font-bold text-red-600">-{formatCurrency(saleData.descuento)}</td>
                </tr>
              )}

              {saleData.interes > 0 && (
                <tr>
                  <td className="text-right pr-4">Interés</td>
                  <td className="text-right font-bold text-blue-600">+{formatCurrency(saleData.interes)}</td>
                </tr>
              )}

              <tr className="border-t-2 border-black">
                <td className="text-right pr-4 font-bold text-lg">TOTAL</td>
                <td className="text-right font-bold text-lg">{formatCurrency(saleData.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
})

InvoiceTemplate.displayName = "InvoiceTemplate"

export default InvoiceTemplate
