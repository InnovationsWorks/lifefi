import { NextRequest, NextResponse } from 'next/server'

const PROJECT_REF = 'gtdhhqhozlrkkxlhuvrn'

const GRANT_SQL = `
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.bank_accounts TO anon, authenticated, service_role;
GRANT ALL ON public.bills TO anon, authenticated, service_role;
GRANT ALL ON public.credit_cards TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`.trim()

export async function POST(req: NextRequest) {
  const pat = req.headers.get('x-supabase-pat') ?? req.nextUrl.searchParams.get('pat')
  const secret = req.headers.get('x-migrate-secret') ?? req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!pat) {
    return NextResponse.json({
      error: 'Missing Supabase Personal Access Token',
      hint: 'Pass it as ?pat=sbp_... or header x-supabase-pat. Get one at https://supabase.com/dashboard/account/tokens',
    }, { status: 400 })
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: GRANT_SQL }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Migration failed', detail: data }, { status: 500 })
  }

  return NextResponse.json({ ok: true, result: data, message: 'GRANTs applied and trigger updated successfully' })
}
