#!/usr/bin/env tsx

import { Address, toNano } from 'ton-core'
import { 
  TREASURY_ADDRESS, 
  createMessageBody, 
  sendTransaction, 
  validateAmount,
  TreasuryError 
} from './utils'

async function fundAirdrop(amount: string | number) {
  try {
    // Validate amount
    if (!validateAmount(amount)) {
      throw new TreasuryError('Invalid amount', 'INVALID_AMOUNT')
    }

    // Convert amount to nano
    const amountNano = typeof amount === 'string' ? toNano(amount) : BigInt(amount)
    
    // Create message body
    const body = createMessageBody('fund_airdrop', [])
    
    // Send transaction with funding amount
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const transaction = await sendTransaction(
      treasuryAddress,
      amountNano, // Funding amount
      body
    )
    
    console.log('✅ Airdrop funded successfully!')
    console.log(`💰 Amount: ${amount} TON`)
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
  
  if (args.length !== 1) {
    console.log('Usage: tsx fundAirdrop.ts <amount>')
    console.log('Example: tsx fundAirdrop.ts 10.5')
    process.exit(1)
  }
  
  const [amount] = args
  
  fundAirdrop(parseFloat(amount)).catch(error => {
    console.error('Failed to fund airdrop:', error.message)
    process.exit(1)
  })
}

export { fundAirdrop } 