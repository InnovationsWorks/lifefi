import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifefi.ai'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // token_hash flow — session-independent, works on any browser/device
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name: (user.user_metadata?.full_name as string) ?? '',
              subscription_tier: 'personal',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )
      }
      return NextResponse.redirect(`${SITE}/dashboard`)
    }
    return NextResponse.redirect(
      `${SITE}/login?error=confirmation_failed&message=Your+confirmation+link+has+expired+or+was+already+used.+Please+sign+up+again.`
    )
  }

  // PKCE code flow — fallback for older confirmation links
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name: (user.user_metadata?.full_name as string) ?? '',
              subscription_tier: 'personal',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )
      }
      return NextResponse.redirect(`${SITE}${next}`)
    }
    return NextResponse.redirect(
      `${SITE}/login?error=confirmation_failed&message=Your+confirmation+link+has+expired.+Please+sign+up+again.`
    )
  }

  return NextResponse.redirect(
    `${SITE}/login?error=confirmation_failed&message=Invalid+confirmation+link.+Please+sign+up+again.`
  )
}
