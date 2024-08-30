"use client"

import { SessionProvider } from 'next-auth/react'
import React, { ReactNode } from 'react'

interface ProviderProps{
    children:ReactNode
}


export default function Provider({children}:ProviderProps) {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}
