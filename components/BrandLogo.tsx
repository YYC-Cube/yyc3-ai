"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export default function BrandLogo({ size = "md", showText = false, className = "" }: BrandLogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode =
        document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(isDarkMode)
    }

    checkDarkMode()

    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", checkDarkMode)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", checkDarkMode)
    }
  }, [])

  const logoSrc = isDark ? "/yyc3-logo-white.png" : "/yyc3-logo-blue.png"

  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  }

  const { width, height } = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0" style={{ width, height }}>
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt="YYC³ Logo"
          width={width}
          height={height}
          priority
          className="object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-medium text-foreground leading-tight">万象归元于云枢</span>
          <span className="text-xs text-muted-foreground leading-tight">深栈智启新纪元</span>
        </div>
      )}
    </div>
  )
}
