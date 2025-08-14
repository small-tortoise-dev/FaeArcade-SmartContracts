#!/usr/bin/env tsx

import { Address, toNano, beginCell } from 'ton-core'
import { 
  TREASURY_ADDRESS, 
  createMessageBody, 
  sendTransaction, 
  TreasuryError 
} from './utils'

async function upgrade(newCodePath: string) {
  try {
    // Validate new code path
    if (!newCodePath || typeof newCodePath !== 'string') {
      throw new TreasuryError('Invalid new code path', 'INVALID_CODE_PATH')
    }

    // Create mock new code cell (in production, this would load from file)
    const newCode = beginCell()
      .storeStringTail('New Treasury Contract Code')
      .endCell()
    
    // Create message body
    const body = createMessageBody('upgrade', [newCode])
    
    // Send transaction
    const treasuryAddress = Address.parse(TREASURY_ADDRESS)
    const transaction = await sendTransaction(
      treasuryAddress,
      toNano('0.1'), // Gas fee
      body
    )
    
    console.log('✅ Contract upgrade initiated successfully!')
    console.log(`🔧 New Code Path: ${newCodePath}`)
    console.log(`🔗 Transaction sent successfully`)
    console.log('⚠️  Note: Only upgrade authority can execute this operation')
    
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
    console.log('Usage: tsx upgrade.ts <newCodePath>')
    console.log('Example: tsx upgrade.ts ./new-treasury.tact')
    console.log('')
    console.log('⚠️  Warning: This operation requires upgrade authority privileges')
    process.exit(1)
  }
  
  const [newCodePath] = args
  
  upgrade(newCodePath).catch(error => {
    console.error('Failed to upgrade contract:', error.message)
    process.exit(1)
  })
}

export { upgrade } 