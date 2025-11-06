// components/SymmetricContainer.jsx
"use client"

export function SymmetricContainer({ children, className = "" }) {
  return (
    <div className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

export function SymmetricContent({ children, className = "" }) {
  return (
    <div className={`w-full bg-white dark:bg-zinc-900 rounded-xl ${className}`}>
      {children}
    </div>
  )
}
