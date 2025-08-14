#!/usr/bin/env tsx

import { Address, toNano } from 'ton-core'
import { 
  TREASURY_ADDRESS, 
  createMessageBody, 
  sendTransaction, 
  validateRoomId, 
  validateDay,
  createWinnersArray,
  createLinearWeights,
  validateLinearWeights,
  TreasuryError 
} from './utils'

async function payoutPaid(
  roomId: number,
  day: number,
  winnersCount: number
) {
  try {
    // Validate inputs
    if (!validateRoomId(roomId)) {
      throw new TreasuryError('Invalid room ID', 'INVALID_ROOM_ID')
    }
    
    if (!validateDay(day)) {
      throw new TreasuryError('Invalid day format', 'INVALID_DAY')
    }

    if (winnersCount <= 0 || winnersCount > 100) {
      throw new TreasuryError('Invalid winners count', 'INVALID_WINNERS_COUNT')
    }

    // Create winners and weights arrays
    const winners = createWinnersArray(winnersCount)
    const weights = createLinearWeights(winnersCount)
    
    // Validate linear weights
    if (!validateLinearWeights(weights)) {
      throw new TreasuryError('Invalid linear weights', 'INVALID_WEIGHTS')
    }

    // Create message body
    const body = createMessageBody('payout_paid', [roomId, day])
    
    // Send transaction
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const transaction = await sendTransaction(
      treasuryAddress,
      toNano('0.1'), // Gas fee
      body
    )
    
    console.log('✅ Payout initiated successfully!')
    console.log(`📊 Room ID: ${roomId}`)
    console.log(`📅 Day: ${day}`)
    console.log(`🏆 Winners Count: ${winnersCount}`)
    console.log(`⚖️ Total Weight: ${weights.reduce((sum, w) => sum + w, 0)}`)
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
  
  if (args.length !== 3) {
    console.log('Usage: tsx payoutPaid.ts <roomId> <day> <winnersCount>')
    console.log('Example: tsx payoutPaid.ts 12345 20241201 100')
    process.exit(1)
  }
  
  const [roomId, day, winnersCount] = args
  
  payoutPaid(
    parseInt(roomId),
    parseInt(day),
    parseInt(winnersCount)
  ).catch(error => {
    console.error('Failed to payout:', error.message)
    process.exit(1)
  })
}

export { payoutPaid } 