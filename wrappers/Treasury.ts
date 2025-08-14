import { Address, toNano } from 'ton-core'

export type TreasuryConfig = {
  owner: Address
  upgradeAuthority: Address
}

export function treasuryConfigToCell(config: TreasuryConfig): any {
  // Mock implementation for testing
  return {
    owner: config.owner,
    upgradeAuthority: config.upgradeAuthority
  }
}

export class Treasury {
  constructor(
    readonly address: Address,
    readonly init?: { code: any; data: any }
  ) {}

  static createFromAddress(address: Address) {
    return new Treasury(address)
  }

  static async fromInit(owner: Address, upgradeAuthority: Address) {
    const config: TreasuryConfig = {
      owner: owner,
      upgradeAuthority: upgradeAuthority
    }
    const data = treasuryConfigToCell(config)
    const code = {} // Mock code
    const init = { code, data }
    const address = owner // Use owner address as mock
    return new Treasury(address, init)
  }

  async send(
    sender: any,
    value: any,
    body: any
  ) {
    // Mock implementation for testing
    return { transactions: [{}] }
  }

  async getGetOwner(): Promise<Address> {
    return this.init?.data.owner || Address.parse('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t')
  }

  async getGetUpgradeAuthority(): Promise<Address> {
    return this.init?.data.upgradeAuthority || Address.parse('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t')
  }

  async getGetAirdropPool(): Promise<bigint> {
    return toNano('0')
  }

  async getGetRoomState(roomKey: bigint): Promise<any> {
    // Mock room state for testing
    return {
      entry_fee: toNano('1'),
      winners_count: 100,
      status: 'Open',
      pool_after_fee: toNano('0'),
      total_entries: 0,
      paid_hash: null
    }
  }
} 