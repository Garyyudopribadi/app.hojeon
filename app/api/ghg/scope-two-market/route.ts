import { NextRequest, NextResponse } from 'next/server'

// API removed: Scope Two - Market endpoint is deprecated.
// Return 410 Gone to indicate resource has been removed.
export async function GET(_request: NextRequest) {
  return NextResponse.json({ error: 'Scope Two - Market API removed' }, { status: 410 })
}