'use client'
import { useState } from 'react'

export default function DonatePage() {
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    setLoading(true)
    const res = await fetch('/api/create-checkout-session', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      window.location.href = data.url
    } else {
      alert('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Support This Project</h1>
      <button
        onClick={handleDonate}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Redirecting…' : 'Donate with Stripe'}
      </button>
    </main>
  )
}
