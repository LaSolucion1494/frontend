"use client"

import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Must be an odd number
    const halfMax = Math.floor(maxPagesToShow / 2)

    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Ellipsis after first page
      if (currentPage > halfMax + 2) {
        pageNumbers.push("...")
      }

      // Pages around current
      let start = Math.max(2, currentPage - halfMax)
      let end = Math.min(totalPages - 1, currentPage + halfMax)

      if (currentPage <= halfMax + 1) {
        end = maxPagesToShow
      }
      if (currentPage >= totalPages - halfMax) {
        start = totalPages - maxPagesToShow + 1
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      // Ellipsis before last page
      if (currentPage < totalPages - halfMax - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const firstItem = (currentPage - 1) * itemsPerPage + 1
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <span>
            Mostrando <strong>{firstItem}</strong>-<strong>{lastItem}</strong> de <strong>{totalItems}</strong>{" "}
            resultados
          </span>
        ) : (
          <span>No hay resultados</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="flex items-center justify-center h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ),
          )}
        </div>

        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
