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

async function closeRoom(
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
    const body = createMessageBody('close_room', [roomId, day])
    
    // Send transaction
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const transaction = await sendTransaction(
      treasuryAddress,
      toNano('0.1'), // Gas fee
      body
    )
    
    console.log('✅ Room closed successfully!')
    console.log(`📊 Room ID: ${roomId}`)
    console.log(`📅 Day: ${day}`)
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
    console.log('Usage: tsx closeRoom.ts <roomId> <day>')
    console.log('Example: tsx closeRoom.ts 12345 20241201')
    process.exit(1)
  }
  
  const [roomId, day] = args
  
  closeRoom(
    parseInt(roomId),
    parseInt(day)
  ).catch(error => {
    console.error('Failed to close room:', error.message)
    process.exit(1)
  })
}

export { closeRoom } 