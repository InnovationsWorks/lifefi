import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan, stripe_customer_id, created_at')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      profile: profile ?? { id: user.id, email: user.email, full_name: '', plan: 'free' },
      user: { id: user.id, email: user.email },
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
