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
 await provider.sender().send({
 to: treasury.address,
 value: toNano('1'), // Initial balance for operations
 init: treasury.init
 })

 // Wait for deployment
 await provider.waitForDeploy(treasury.address)

 console.log('Treasury deployed successfully!')
 console.log('Address:', treasury.address)
 console.log('Owner:', deployer)
 console.log('Upgrade Authority:', deployer)
 console.log('Initial Balance: 1 TON')
 
 // Save deployment info
 console.log('\nAdd to your .env file:')
 console.log(`TREASURY_ADDRESS=${treasury.address}`)
} 