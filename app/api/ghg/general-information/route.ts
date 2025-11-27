import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch data directly from general_information_business table in Supabase
    const { data, error } = await supabase
      .from('general_information_business')
      .select('entity, facility')
      .order('entity', { ascending: true })
      .order('facility', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Log data for debugging
    console.log('API Response Data:', {
      count: data?.length || 0,
      entities: data ? [...new Set(data.map(item => item.entity))] : [],
      facilities: data ? [...new Set(data.map(item => item.facility))] : [],
      entityFacilityMap: data ? data.reduce((acc, item) => {
        if (!acc[item.entity]) acc[item.entity] = []
        acc[item.entity].push(item.facility)
        return acc
      }, {} as Record<string, string[]>) : {}
    })

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      isSampleData: false,
      message: 'Data from Supabase database'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
