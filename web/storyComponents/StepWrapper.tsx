'use client'

export default function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-8">
        {children}
      </div>
    </main>
  )
}
