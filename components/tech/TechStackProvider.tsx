// components/tech/TechStackProvider.tsx
"use client"

import { createContext, useContext, ReactNode } from 'react'

interface TechStack {
  ui: {
    components: string[]
    themes: string[]
    icons: string[]
  }
  frameworks: {
    frontend: string[]
    backend: string[]
    mobile: string[]
  }
  libraries: {
    state: string[]
    routing: string[]
    utility: string[]
  }
}

interface TechStackContextType {
  stack: TechStack
  addComponent: (category: keyof TechStack, item: string) => void
  removeComponent: (category: keyof TechStack, item: string) => void
}

const defaultTechStack: TechStack = {
  ui: {
    components: ['shadcn/ui', 'Tailwind CSS', 'Radix UI'],
    themes: ['default', 'dark', 'blue', 'purple'],
    icons: ['Lucide Icons']
  },
  frameworks: {
    frontend: ['React', 'Next.js', 'Vue', 'Angular'],
    backend: ['Node.js', 'Express', 'NestJS'],
    mobile: ['React Native', 'Flutter']
  },
  libraries: {
    state: ['Zustand', 'Redux', 'MobX'],
    routing: ['React Router', 'Next.js Router'],
    utility: ['Lodash', 'Date-fns', 'Axios']
  }
}

const TechStackContext = createContext<TechStackContextType | undefined>(undefined)

export function TechStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<TechStack>(defaultTechStack)

  const addComponent = (category: keyof TechStack, item: string) => {
    setStack(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [Object.keys(prev[category])[0]]: [
          ...(prev[category as keyof typeof prev][Object.keys(prev[category])[0] as any] as string[]),
          item
        ]
      }
    }))
  }

  const removeComponent = (category: keyof TechStack, item: string) => {
    setStack(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [Object.keys(prev[category])[0]]: (
          prev[category as keyof typeof prev][Object.keys(prev[category])[0] as any] as string[]
        ).filter(i => i !== item)
      }
    }))
  }

  return (
    <TechStackContext.Provider value={{ stack, addComponent, removeComponent }}>
      {children}
    </TechStackContext.Provider>
  )
}
