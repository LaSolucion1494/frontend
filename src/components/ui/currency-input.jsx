"use client"

import { forwardRef } from "react"
import { NumericFormat } from "react-number-format"
import { cn } from "../../lib/utils"

const CurrencyInput = forwardRef(({ className, value, onValueChange, placeholder, ...props }, ref) => {
  return (
    <NumericFormat
      getInputRef={ref}
      value={value || ""}
      onValueChange={(values) => {
        const { floatValue } = values
        onValueChange(floatValue || 0)
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$ "
      decimalScale={2}
      fixedDecimalScale={false}
      allowNegative={false}
      placeholder={placeholder || "$ 0"}
      className={cn(
        "flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
})

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
