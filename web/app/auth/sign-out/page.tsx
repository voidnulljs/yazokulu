'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      await supabase.auth.signOut()
      router.push('/')
    }

    signOut()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Çıkış yapılıyor...</h1>
      </div>
    </div>
  )
}
