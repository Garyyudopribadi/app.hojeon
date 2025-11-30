// Test calculation untuk verifikasi rumus Scope 2 Market

type TestData = {
  name: string
  country: string
  totalMWh: number
  expectedKgCO2: number
  expectedKgCH4: number
  expectedKgN2O: number
  expectedTCO2eq: number
}

const testCases: TestData[] = [
  {
    name: "Record 1: HOJEON LIMITED (Korea 2022)",
    country: "Korea",
    totalMWh: 398.334867,
    expectedKgCO2: 185345.21346,
    expectedKgCH4: 3.793665,
    expectedKgN2O: 2.055922,
    expectedTCO2eq: 186.008909
  },
  {
    name: "Record 4: KAHOINDAH (Indonesia 2022)",
    country: "Indonesia",
    totalMWh: 1662.42,
    expectedKgCO2: 1281227.094,
    expectedKgCH4: 63.330286,
    expectedKgN2O: 21.450581,
    expectedTCO2eq: 1446.3054
  },
  {
    name: "Record 11: YONGJIN 1공장 (Indonesia 2022)",
    country: "Indonesia",
    totalMWh: 1315.392,
    expectedKgCO2: 1013772.6144,
    expectedKgCH4: 50.110171,
    expectedKgN2O: 16.9728,
    expectedTCO2eq: 1144.39104
  },
  {
    name: "Record 12: YONGJIN 2,3공장 (Indonesia 2022)",
    country: "Indonesia",
    totalMWh: 7830.616,
    expectedKgCO2: 6035055.7512,
    expectedKgCH4: 298.309181,
    expectedKgN2O: 101.040206,
    expectedTCO2eq: 6812.63592
  }
]

function calculate(country: string, totalMWh: number) {
  const mj = totalMWh * 3600
  const countryLower = country.toLowerCase()
  
  let CO2_GRID_FACTOR = 0.12925  // kgCO2/MJ for Korea
  let CH4_EF_PER_MJ = 0.00000265
  let N2O_EF_PER_MJ = 0.00000143
  let T_AND_D_LOSS_FACTOR = 1.0
  
  if (countryLower.includes('indonesia') || countryLower.includes('indon')) {
    CO2_GRID_FACTOR = 0.214083
    CH4_EF_PER_MJ = 0.0000106
    N2O_EF_PER_MJ = 0.00000359
    T_AND_D_LOSS_FACTOR = 1.12186042  // Indonesia T&D loss adjustment
  }
  
  const kgCO2 = mj * CO2_GRID_FACTOR
  const kgCH4 = mj * CH4_EF_PER_MJ
  const kgN2O = mj * N2O_EF_PER_MJ
  const tCO2eq = ((kgCO2 + kgCH4 * 25 + kgN2O * 298) / 1000) * T_AND_D_LOSS_FACTOR
  
  return { kgCO2, kgCH4, kgN2O, tCO2eq }
}

console.log("=== TESTING SCOPE 2 MARKET CALCULATIONS ===\n")

let allPassed = true

for (const test of testCases) {
  console.log(test.name)
  console.log("-".repeat(60))
  
  const result = calculate(test.country, test.totalMWh)
  
  const kgCO2Diff = Math.abs(result.kgCO2 - test.expectedKgCO2)
  const kgCH4Diff = Math.abs(result.kgCH4 - test.expectedKgCH4)
  const kgN2ODiff = Math.abs(result.kgN2O - test.expectedKgN2O)
  const tCO2eqDiff = Math.abs(result.tCO2eq - test.expectedTCO2eq)
  
  const kgCO2Pass = kgCO2Diff < 0.01
  const kgCH4Pass = kgCH4Diff < 0.01
  const kgN2OPass = kgN2ODiff < 0.01
  const tCO2eqPass = tCO2eqDiff < 0.05
  
  console.log(`Input: ${test.totalMWh} MWh (${test.country})`)
  console.log(`kgCO2:  Calc=${result.kgCO2.toFixed(2)}, Expected=${test.expectedKgCO2.toFixed(2)}, Diff=${kgCO2Diff.toFixed(4)} ${kgCO2Pass ? '✓' : '✗'}`)
  console.log(`kgCH4:  Calc=${result.kgCH4.toFixed(6)}, Expected=${test.expectedKgCH4.toFixed(6)}, Diff=${kgCH4Diff.toFixed(8)} ${kgCH4Pass ? '✓' : '✗'}`)
  console.log(`kgN2O:  Calc=${result.kgN2O.toFixed(6)}, Expected=${test.expectedKgN2O.toFixed(6)}, Diff=${kgN2ODiff.toFixed(8)} ${kgN2OPass ? '✓' : '✗'}`)
  console.log(`tCO2eq: Calc=${result.tCO2eq.toFixed(2)}, Expected=${test.expectedTCO2eq.toFixed(2)}, Diff=${tCO2eqDiff.toFixed(4)} ${tCO2eqPass ? '✓' : '✗'}`)
  
  const testPassed = kgCO2Pass && kgCH4Pass && kgN2OPass && tCO2eqPass
  console.log(`Status: ${testPassed ? '✓ PASSED' : '✗ FAILED'}`)
  console.log()
  
  if (!testPassed) allPassed = false
}

console.log("=".repeat(60))
console.log(allPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED")

// Calculate total for 2022
console.log("\n=== 2022 TOTAL CALCULATION ===")
const total2022 = testCases.reduce((sum, test) => {
  const result = calculate(test.country, test.totalMWh)
  return sum + result.tCO2eq
}, 0)

// Add remaining 2022 records
const record17 = calculate("Indonesia", 13.095)  // PT. HJL INDO NETWORKS
const record18 = calculate("Indonesia", 9.4743)  // PT. HJL INDO NETWORKS
const record23 = calculate("Indonesia", 2378.016) // PT.HOGA REKSA GARMENT
const record26 = calculate("Korea", 6.722133)    // MFAFA

const grandTotal = total2022 + record17.tCO2eq + record18.tCO2eq + record23.tCO2eq + record26.tCO2eq

console.log(`From test cases: ${total2022.toFixed(2)} tCO2eq`)
console.log(`Record 17: ${record17.tCO2eq.toFixed(2)} tCO2eq`)
console.log(`Record 18: ${record18.tCO2eq.toFixed(2)} tCO2eq`)
console.log(`Record 23: ${record23.tCO2eq.toFixed(2)} tCO2eq`)
console.log(`Record 26: ${record26.tCO2eq.toFixed(2)} tCO2eq`)
console.log(`-`.repeat(40))
console.log(`Total 2022: ${grandTotal.toFixed(2)} tCO2eq`)
console.log(`Expected:   11680.99 tCO2eq`)
console.log(`Difference: ${Math.abs(grandTotal - 11680.99).toFixed(2)} tCO2eq`)
