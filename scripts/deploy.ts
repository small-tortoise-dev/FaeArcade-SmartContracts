import { toNano } from 'ton-core'
import { Treasury } from '../wrappers/Treasury'
import { NetworkProvider, compile } from '@ton/blueprint'

export async function run(provider: NetworkProvider) {
  // Get deployer address
  const deployer = provider.sender()?.address!
  
  // Create Treasury contract
  const treasury = provider.open(
    await Treasury.fromInit(deployer, deployer) // owner = upgrade_authority
  )

  // Deploy with initial balance
  await treasury.send(
    provider.sender(),
    {
      value: toNano('1'), // Initial balance for operations
    },
    {
      $$type: 'Deploy',
      queryId: 0n,
    }
  )

  // Wait for deployment
  await provider.waitForDeploy(treasury.address)

  console.log('✅ Treasury deployed successfully!')
  console.log('📍 Address:', treasury.address)
  console.log('👑 Owner:', deployer)
  console.log('🔧 Upgrade Authority:', deployer)
  console.log('💰 Initial Balance: 1 TON')
  
  // Save deployment info
  console.log('\n📝 Add to your .env file:')
  console.log(`TREASURY_ADDRESS=${treasury.address}`)
} 