import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ghg_scopeone')
      .select('*')

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message ?? 'Failed to fetch data' }, { status: 500 })
  }
}
