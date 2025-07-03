import React from 'react';
import { BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="relative">
        {/* Header */}
        <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-primary-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <BookOpen className="h-6 w-6 text-black" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Jargon<span className="text-primary-400">Play</span>
                </h1>
              </div>
              <div className="text-sm text-gray-400">
                Interactive Word Learning
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}