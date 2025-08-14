import { Address, toNano, beginCell, Cell } from 'ton-core'
import { TonClient, WalletContractV4, internal } from 'ton'
import { mnemonicToPrivateKey } from 'ton-crypto'

// Environment variables
export const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS!
export const NETWORK = process.env.NETWORK || 'testnet'
export const MNEMONIC = process.env.MNEMONIC!

// Network configuration
export const NETWORK_CONFIG = {
  testnet: {
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
  },
  mainnet: {
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
  }
}

// Initialize TON client
export function getTonClient(): TonClient {
  const config = NETWORK_CONFIG[NETWORK as keyof typeof NETWORK_CONFIG]
  return new TonClient({
    endpoint: config.endpoint,
    apiKey: config.apiKey
  })
}

// Initialize wallet
export async function getWallet(): Promise<WalletContractV4> {
  const privateKey = await mnemonicToPrivateKey(MNEMONIC.split(' '))
  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: privateKey.publicKey
  })
  return wallet
}

// Get wallet sender
export async function getSender() {
  const client = getTonClient()
  const wallet = await getWallet()
  const privateKey = await mnemonicToPrivateKey(MNEMONIC.split(' '))
  const sender = wallet.sender(client, privateKey)
  return sender
}

// Helper to create room key
export function createRoomKey(roomId: number, day: number): bigint {
  return BigInt(roomId) + BigInt(day)
}

// Helper to create winners array
export function createWinnersArray(count: number): Address[] {
  const addresses: Address[] = []
  for (let i = 0; i < count; i++) {
    // Generate mock addresses for testing
    const mockAddress = Address.parse(`EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_${i.toString().padStart(2, '0')}`)
    addresses.push(mockAddress)
  }
  return addresses
}

// Helper to create linear weights array
export function createLinearWeights(count: number): number[] {
  const weights: number[] = []
  for (let i = 0; i < count; i++) {
    weights.push(count - i) // 1st place gets n, 2nd gets n-1, etc.
  }
  return weights
}

// Helper to validate linear weights
export function validateLinearWeights(weights: number[]): boolean {
  const n = weights.length
  const expectedSum = (n * (n + 1)) / 2
  const actualSum = weights.reduce((sum, weight) => sum + weight, 0)
  return actualSum === expectedSum
}

// Helper to create message body for contract calls
export function createMessageBody(method: string, params: any[]): Cell {
  const cell = beginCell()
  
  // Store method name
  cell.storeUint(0, 32) // op code for comment
  cell.storeStringTail(method)
  
  // Store parameters based on method
  switch (method) {
    case 'open_room':
      cell.storeUint(params[0], 256) // room_id
      cell.storeUint(params[1], 32)  // day
      cell.storeCoins(params[2])     // entry_fee
      cell.storeUint(params[3], 32)  // tier
      break
      
    case 'enter_paid':
      cell.storeUint(params[0], 256) // room_id
      cell.storeUint(params[1], 32)  // day
      break
      
    case 'close_room':
      cell.storeUint(params[0], 256) // room_id
      cell.storeUint(params[1], 32)  // day
      break
      
    case 'payout_paid':
      cell.storeUint(params[0], 256) // room_id
      cell.storeUint(params[1], 32)  // day
      // winners and weights would be stored as slices
      break
      
    case 'payout_airdrop':
      // top and streak arrays would be stored as slices
      break
      
    case 'upgrade':
      cell.storeRef(params[0]) // new_code cell
      break
  }
  
  return cell.endCell()
}

// Helper to send transaction
export async function sendTransaction(
  to: Address,
  value: bigint,
  body: Cell,
  comment?: string
) {
  const client = getTonClient()
  const sender = await getSender()
  
  const transaction = await sender.send({
    to: to,
    value: value,
    body: body,
    bounce: false
  })
  
  return transaction
}

// Helper to wait for transaction confirmation
export async function waitForTransaction(txHash: string, maxAttempts: number = 10) {
  const client = getTonClient()
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const tx = await client.getTransaction(TREASURY_ADDRESS, txHash)
      if (tx) return tx
    } catch (e) {
      // Transaction not found yet
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  throw new Error('Transaction not confirmed within timeout')
}

// Helper to get contract balance
export async function getContractBalance(address: string): Promise<bigint> {
  const client = getTonClient()
  const balance = await client.getBalance(Address.parse(address))
  return balance
}

// Helper to get room state
export async function getRoomState(roomKey: bigint) {
  const client = getTonClient()
  const treasury = Address.parse(TREASURY_ADDRESS)
  
  // This would call a getter method on the contract
  // For now, return mock data
  return {
    entry_fee: toNano('1'),
    winners_count: 100,
    status: 'Open',
    pool_after_fee: toNano('0'),
    total_entries: 0,
    paid_hash: null
  }
}

// Error handling
export class TreasuryError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'TreasuryError'
  }
}

// Validation helpers
export function validateAddress(address: string): boolean {
  try {
    Address.parse(address)
    return true
  } catch {
    return false
  }
}

export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num > 0 && isFinite(num)
}

export function validateRoomId(roomId: number): boolean {
  return Number.isInteger(roomId) && roomId > 0
}

export function validateDay(day: number): boolean {
  return Number.isInteger(day) && day >= 20240000 && day <= 20300000
}

export function validateTier(tier: number): boolean {
  return [1, 2, 3].includes(tier)
} 