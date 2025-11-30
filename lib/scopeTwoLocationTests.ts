/**
 * Test Cases for Scope 2 Location-Based Emission Calculations
 * Based on: Hojeon Limited_Scope 1, 2 emissions calculation.xlsx
 */

// Test Case 1: Korea - HOJEON LIMITED 2022
export const testKorea2022 = {
  input: {
    entity: 'HOJEON LIMITED',
    facility: 'HOJEON LIMITED Co., Ltd',
    country: 'Korea',
    classification: 'Electricity',
    january: 32.4612,
    february: 30.059866666666668,
    march: 28.296533333333333,
    april: 25.639733333333336,
    may: 31.623266666666666,
    june: 37.440533333333335,
    july: 45.29566666666666,
    august: 45.907333333333334,
    september: 35.6192,
    october: 24.90066666666667,
    november: 26.7502,
    december: 34.34066666666667,
    unit: 'MWh',
    year: 2022
  },
  expected: {
    total_amount: 398.33486666666664,
    total_mj: 1434005.52,
    kgCO2: 185345.21346,
    kgCH4: 3.793665396825397,
    kgN2O: 2.055921892473118,
    tCO2eq: 186.00890910235947
  }
}

// Test Case 2: Indonesia - PT. KAHOINDAH CITRAGARMENT 2022
export const testIndonesia2022 = {
  input: {
    entity: 'PT. KAHOINDAH CITRAGARMENT',
    facility: 'KAHOINDAH CITRAGARMENT',
    country: 'Indonesia',
    classification: 'Electricity',
    january: 133.18,
    february: 126.64,
    march: 119.65,
    april: 143.57,
    may: 131.12,
    june: 117.15,
    july: 162.06,
    august: 163.09,
    september: 162.14,
    october: 137.82,
    november: 132.26,
    december: 133.74,
    unit: 'MWh',
    year: 2022
  },
  expected: {
    total_amount: 1662.4199999999998,
    total_mj: 5984711.999999999,
    kgCO2: 1281227.094,
    kgCH4: 63.330285714285715,
    kgN2O: 21.45058064516129,
    tCO2eq: 1446.3054
  }
}

// Test Case 3: Korea - ㈜엠파파 2024
export const testKoreaMfafa2024 = {
  input: {
    entity: '㈜엠파파',
    facility: 'MFAFA Co., Ltd',
    country: 'Korea',
    classification: 'Electricity',
    january: 0.47653333333333336,
    february: 0.356,
    march: 0.3354,
    april: 0.2722,
    may: 0.3845333333333334,
    june: 0.5754,
    july: 0.7157333333333333,
    august: 0.8114,
    september: 0.5432666666666667,
    october: 0.333,
    november: 0.2991333333333333,
    december: 0.4734,
    unit: 'MWh',
    year: 2024
  },
  expected: {
    total_amount: 5.5760000000000005,
    total_mj: 20073.600000000002,
    kgCO2: 2594.5128000000004,
    kgCH4: 0.05310476190476191,
    kgN2O: 0.02877935483870968,
    tCO2eq: 2.603803392442397
  }
}

// Test Case 4: Indonesia - PT. YONGJIN JAVASUKA GARMENT 2024
export const testIndonesiaYongjin2024 = {
  input: {
    entity: 'PT. YONGJIN JAVASUKA GARMENT',
    facility: 'PT. YONGJIN JAVASUKA GARMENT (1공장)',
    country: 'Indonesia',
    classification: 'Electricity',
    january: 108.967,
    february: 114.688,
    march: 104.992,
    april: 103.264,
    may: 138.6416,
    june: 140.3936,
    july: 98,
    august: 129.8288,
    september: 143.0336,
    october: 169.0976,
    november: 142.5408,
    december: 152.9744,
    unit: 'MWh',
    year: 2024
  },
  expected: {
    total_amount: 1546.4214000000002,
    total_mj: 5567117.040000001,
    kgCO2: 1191826.9729800003,
    kgCH4: 58.91129142857144,
    kgN2O: 19.953824516129036,
    tCO2eq: 1345.3866180000002
  }
}

/**
 * Utility function to compare calculated vs expected with tolerance
 */
export function compareResults(calculated: any, expected: any, tolerance = 0.01) {
  const results = {
    passed: true,
    details: {} as any
  }

  for (const key in expected) {
    const calc = calculated[key]
    const exp = expected[key]
    const diff = Math.abs(calc - exp)
    const percentDiff = (diff / exp) * 100
    
    const passed = percentDiff <= tolerance
    
    results.details[key] = {
      calculated: calc,
      expected: exp,
      difference: diff,
      percentDiff: percentDiff.toFixed(4) + '%',
      passed
    }
    
    if (!passed) {
      results.passed = false
    }
  }

  return results
}

/**
 * Run all test cases
 */
export function runAllTests(calculateFunction: Function) {
  console.log('🧪 Running Scope 2 Location-Based Emission Tests...\n')

  const tests = [
    { name: 'Korea 2022 - HOJEON LIMITED', data: testKorea2022 },
    { name: 'Indonesia 2022 - PT. KAHOINDAH', data: testIndonesia2022 },
    { name: 'Korea 2024 - ㈜엠파파', data: testKoreaMfafa2024 },
    { name: 'Indonesia 2024 - PT. YONGJIN', data: testIndonesiaYongjin2024 }
  ]

  let allPassed = true

  tests.forEach((test, idx) => {
    console.log(`\n📋 Test ${idx + 1}: ${test.name}`)
    console.log('─'.repeat(60))
    
    const calculated = calculateFunction(test.data.input)
    const comparison = compareResults(calculated, test.data.expected)
    
    console.log('Results:')
    for (const key in comparison.details) {
      const detail = comparison.details[key]
      const icon = detail.passed ? '✅' : '❌'
      console.log(`${icon} ${key}:`)
      console.log(`   Calculated: ${detail.calculated.toFixed(2)}`)
      console.log(`   Expected:   ${detail.expected.toFixed(2)}`)
      console.log(`   Difference: ${detail.difference.toFixed(4)} (${detail.percentDiff})`)
    }
    
    if (comparison.passed) {
      console.log('\n✅ Test PASSED')
    } else {
      console.log('\n❌ Test FAILED')
      allPassed = false
    }
  })

  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 All tests PASSED!')
  } else {
    console.log('⚠️  Some tests FAILED. Please review the calculations.')
  }
  console.log('='.repeat(60))

  return allPassed
}
