// components/ui/tabs.tsx - 完整修复版本
"use client"

import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ 
  className, 
  value: controlledValue, 
  defaultValue, 
  onValueChange,
  children,
  ...props 
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div
        data-orientation="horizontal"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 dark:bg-zinc-800 dark:text-zinc-400 py-1 leading-7 text-[rgba(255,255,255,1)]",
        className
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ className, value, onClick, ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component")
  }

  const { value: selectedValue, onValueChange } = context
  const isActive = selectedValue === value

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onValueChange(value)
    onClick?.(e)
  }

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50 italic border-none",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component")
  }

  const { value: selectedValue } = context
  
  if (selectedValue !== value) {
    return null
  }

  return (
    <div
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300",
        className
      )}
      {...props}
    />
  )
}
