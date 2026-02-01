import StreamClientProvider from '@/components/provider/StreamClientProvider'
import React, { ReactNode } from 'react'

function Layout({ children }: { children: ReactNode }) {
    return (
        <StreamClientProvider>
            {children}
        </StreamClientProvider>
    )
}

export default Layout