#!/usr/bin/env tsx

import { Address, toNano } from 'ton-core'
import { 
  TREASURY_ADDRESS, 
  createMessageBody, 
  sendTransaction, 
  createWinnersArray,
  TreasuryError 
} from './utils'

async function payoutAirdrop(
  topWinnersCount: number,
  streakWinnersCount: number
) {
  try {
    // Validate inputs
    if (topWinnersCount < 0 || topWinnersCount > 1000) {
      throw new TreasuryError('Invalid top winners count', 'INVALID_TOP_COUNT')
    }
    
    if (streakWinnersCount < 0 || streakWinnersCount > 1000) {
      throw new TreasuryError('Invalid streak winners count', 'INVALID_STREAK_COUNT')
    }

    // Create winners arrays
    const topWinners = createWinnersArray(topWinnersCount)
    const streakWinners = createWinnersArray(streakWinnersCount)
    
    // Create message body
    const body = createMessageBody('payout_airdrop', [])
    
    // Send transaction
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const transaction = await sendTransaction(
      treasuryAddress,
      toNano('0.1'), // Gas fee
      body
    )
    
    console.log('✅ Airdrop payout initiated successfully!')
    console.log(`🏆 Top Winners: ${topWinnersCount}`)
    console.log(`🔥 Streak Winners: ${streakWinnersCount}`)
    console.log(`💰 50/50 split: Top winners get 50%, Streak winners get 50%`)
    console.log(`🔗 Transaction sent successfully`)
    
    return transaction
    
  } catch (error) {
    if (error instanceof TreasuryError) {
      console.error(`❌ Treasury Error: ${error.message}`)
      console.error(`🔍 Error Code: ${error.code}`)
    } else {
      console.error('❌ Unexpected error:', error)
    }
    throw error
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length !== 2) {
    console.log('Usage: tsx payoutAirdrop.ts <topWinnersCount> <streakWinnersCount>')
    console.log('Example: tsx payoutAirdrop.ts 10 5')
    process.exit(1)
  }
  
  const [topWinnersCount, streakWinnersCount] = args
  
  payoutAirdrop(
    parseInt(topWinnersCount),
    parseInt(streakWinnersCount)
  ).catch(error => {
    console.error('Failed to payout airdrop:', error.message)
    process.exit(1)
  })
}

export { payoutAirdrop } 