import React, { ReactNode } from 'react';
import Header from './Header';
import { ToastProvider } from './ui/ToastContext';
import AppTour from './ui/AppTour';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <AppTour />
            <div className="h-screen w-screen overflow-hidden bg-bg text-text flex flex-col font-sans">
                <Header />
                <main className="flex-1 flex overflow-hidden">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
