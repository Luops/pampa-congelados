"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft, ArrowRight, Smartphone } from "lucide-react"

export default function SwipeTutorial() {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    // Mostrar tutorial apenas na primeira visita
    const hasSeenTutorial = localStorage.getItem("swipe-tutorial-seen")
    if (!hasSeenTutorial && window.innerWidth <= 768) {
      setTimeout(() => setShowTutorial(true), 2000)
    }
  }, [])

  const closeTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem("swipe-tutorial-seen", "true")
  }

  if (!showTutorial) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={closeTutorial}>
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="mb-4">
            <Smartphone className="h-12 w-12 mx-auto text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold mb-4">Gestos de Navegação</h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Menu Principal</p>
                <p className="text-gray-600">Deslize ← para fechar</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Carrinho</p>
                <p className="text-gray-600">Deslize → para fechar</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={closeTutorial} className="w-full">
              Entendi!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
