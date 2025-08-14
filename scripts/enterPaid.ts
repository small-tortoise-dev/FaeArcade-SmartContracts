#!/usr/bin/env tsx

import { Address, toNano } from 'ton-core'
import { 
  TREASURY_ADDRESS, 
  createMessageBody, 
  sendTransaction, 
  validateRoomId, 
  validateDay,
  TreasuryError 
} from './utils'

async function enterPaid(
  roomId: number,
  day: number
) {
  try {
    // Validate inputs
    if (!validateRoomId(roomId)) {
      throw new TreasuryError('Invalid room ID', 'INVALID_ROOM_ID')
    }
    
    if (!validateDay(day)) {
      throw new TreasuryError('Invalid day format', 'INVALID_DAY')
    }

    // Create message body
    const body = createMessageBody('enter_paid', [roomId, day])
    
    // Send transaction with entry fee
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const entryFee = toNano('1') // This should match the room's entry fee
    
    const transaction = await sendTransaction(
      treasuryAddress,
      entryFee, // Entry fee + gas
      body
    )
    
    console.log('✅ Entered paid room successfully!')
    console.log(`📊 Room ID: ${roomId}`)
    console.log(`📅 Day: ${day}`)
    console.log(`💰 Entry Fee: 1 TON`)
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
    console.log('Usage: tsx enterPaid.ts <roomId> <day>')
    console.log('Example: tsx enterPaid.ts 12345 20241201')
    console.log('')
    console.log('Note: This script enters with a 1 TON entry fee')
    process.exit(1)
  }
  
  const [roomId, day] = args
  
  enterPaid(
    parseInt(roomId),
    parseInt(day)
  ).catch(error => {
    console.error('Failed to enter room:', error.message)
    process.exit(1)
  })
}

export { enterPaid } 