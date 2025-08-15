# FAE Arcade Treasury - TON Smart Contract

> **Upgradeable Treasury Contract for FAE Arcade Gaming Platform**
> 
> A sophisticated smart contract system managing paid game rooms, linear weighted payouts, and weekly airdrops on TON blockchain.

## 🎯 **Overview**

FAE Arcade Treasury is a production-ready smart contract that manages the economic layer of the FAE Arcade gaming platform. It handles paid game rooms with risk-based tiers, implements linear weighted payout systems, and manages weekly airdrop distributions.

## 🎮 **Game Modes**

### **Free Mode (Airdrop)**
- **Weekly Distribution**: 50% top scorers + 50% streak winners
- **Equal Splits**: Even distribution within each category
- **Community Funded**: Accepts contributions from users and platform

### **Paid Mode (Game Rooms)**
- **Entry Fees**: Configurable per room (typically 1-10 TON)
- **House Fee**: **2.5%** of entry fees
- **Risk Tiers**: 
  - **Low Risk**: 100 winners (Tier 1)
  - **Medium Risk**: 50 winners (Tier 2) 
  - **High Risk**: 20 winners (Tier 3)

## 🧮 **Mathematical Foundation**

### **Linear Weighted Payout System**

The Treasury uses a sophisticated linear weight distribution where higher ranks receive proportionally more rewards.

#### **Weight Formula**
```
W = N(N+1)/2
```
Where:
- `W` = Total weight
- `N` = Number of winners

#### **Individual Payout Formula**
```
P_i = R × (N-i+1) / W
```
Where:
- `P_i` = Payout for position i
- `R` = Pool after house fee
- `i` = Position (1st, 2nd, 3rd...)
- `N` = Total winners
- `W` = Total weight

### **Medium-Tier Example**

**Scenario**: Medium risk room with 50 winners
- **Entry Fee**: 1 TON per player
- **Players**: 100 participants
- **House Fee**: 2.5% = 2.5 TON
- **Pool After Fee (R)**: 97.5 TON
- **Winners (N)**: 50
- **Total Weight (W)**: 50 × 51 ÷ 2 = **1,275**

**Payouts**:
- **1st Place**: 97.5 × 50 ÷ 1,275 ≈ **38.24 TON**
- **2nd Place**: 97.5 × 49 ÷ 1,275 ≈ **37.47 TON**
- **25th Place**: 97.5 × 26 ÷ 1,275 ≈ **19.88 TON**
- **50th Place**: 97.5 × 1 ÷ 1,275 ≈ **0.76 TON**

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- pnpm 8+
- TON wallet with testnet coins

### **Installation**
```bash
# Clone repository
git clone https://github.com/your-org/fae-ton.git
cd fae-ton

# Install dependencies
pnpm install

# Build contracts
pnpm run build:contracts

# Run tests
pnpm test
```

### **Environment Setup**
Create `.env` file:
```bash
# TON Network Configuration
TREASURY_ADDRESS=EQ...your_treasury_address
NETWORK=testnet
TONCENTER_API_KEY=your_api_key_here

# Wallet Configuration
MNEMONIC="your wallet mnemonic phrase here"

# Optional Overrides
TON_MAINNET_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
TON_TESTNET_ENDPOINT=https://testnet.toncenter.com/api/v2/jsonRPC
```

## 🛠️ **Scripts Usage**

### **Room Management**

#### **Open Room**
```bash
# Open a new game room
tsx scripts/openRoom.ts <roomId> <day> <entryFee> <tier>

# Example: Open low-risk room with 1 TON entry fee
tsx scripts/openRoom.ts 12345 20241201 1.0 1
```

#### **Enter Room**
```bash
# User enters a paid room
tsx scripts/enterPaid.ts <roomId> <day>

# Example: Enter room 12345 on Dec 1, 2024
tsx scripts/enterPaid.ts 12345 20241201
```

#### **Close Room**
```bash
# Admin closes room (stops accepting entries)
tsx scripts/closeRoom.ts <roomId> <day>

# Example: Close room 12345 on Dec 1, 2024
tsx scripts/closeRoom.ts 12345 20241201
```

#### **Payout Winners**
```bash
# Admin pays out winners
tsx scripts/payoutPaid.ts <roomId> <day> <winnersCount>

# Example: Payout 100 winners for room 12345
tsx scripts/payoutPaid.ts 12345 20241201 100
```

### **Airdrop Management**

#### **Fund Airdrop Pool**
```bash
# Fund the airdrop pool
tsx scripts/fundAirdrop.ts <amount>

# Example: Fund 10.5 TON to airdrop pool
tsx scripts/fundAirdrop.ts 10.5
```

#### **Distribute Airdrop**
```bash
# Distribute weekly airdrop
tsx scripts/payoutAirdrop.ts <topWinners> <streakWinners>

# Example: Distribute to 10 top winners and 5 streak winners
tsx scripts/payoutAirdrop.ts 10 5
```

### **Contract Management**

#### **Upgrade Contract**
```bash
# Upgrade Treasury contract (upgrade authority only)
tsx scripts/upgrade.ts <newCodePath>

# Example: Upgrade with new contract code
tsx scripts/upgrade.ts ./new-treasury.tact
```

## 🔒 **Safety Features**

### **Idempotency Protection**
- **Duplicate Payout Prevention**: `paid_hash` prevents double payouts
- **Room State Validation**: Prevents operations on non-existent rooms
- **Transaction Deduplication**: Hash-based operation tracking

### **Access Control**
- **Admin Functions**: Only owner can open/close rooms and payout winners
- **Upgrade Authority**: Separate address for contract upgrades
- **Public Functions**: `enter_paid` and `fund_airdrop` accessible to all

### **Dust Handling**
- **Precision Management**: Nanoton-level accuracy
- **Rounding Strategy**: Dust amounts distributed to top ranks
- **Balance Verification**: Total payouts ≤ pool amount

### **Upgrade Path**
- **Upgradeable Architecture**: Contract code can be updated
- **State Preservation**: All data and balances maintained
- **Authority Separation**: Upgrade authority distinct from owner
- **Rollback Capability**: Previous versions can be restored

## 🧪 **Testing**

### **Run All Tests**
```bash
pnpm test
```

### **Test Categories**
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end flow testing
- **Security Tests**: Access control and validation
- **Mathematical Tests**: Formula accuracy verification

### **Test Coverage**
- **Paid Room Flow**: 19 tests
- **Airdrop Distribution**: 15 tests
- **Security & Validation**: 22 tests
- **Total**: 64 comprehensive tests





## 📁 **Project Structure**

```
fae-ton/
├── contracts/                 # Tact smart contracts
│   ├── Treasury.tact         # Main Treasury contract
│   ├── interfaces/           # Contract interfaces
│   └── lib/                  # Utility libraries
├── scripts/                  # TypeScript scripts
│   ├── utils.ts             # Core utilities
│   ├── openRoom.ts          # Room management
│   ├── enterPaid.ts         # User entry
│   ├── closeRoom.ts         # Room closure
│   ├── payoutPaid.ts        # Winner payouts
│   ├── fundAirdrop.ts       # Airdrop funding
│   ├── payoutAirdrop.ts     # Airdrop distribution
│   └── upgrade.ts           # Contract upgrades
├── tests/                   # Test suites
│   ├── treasury.paid.test.ts    # Paid room testing
│   ├── treasury.airdrop.test.ts # Airdrop testing
│   └── treasury.security.test.ts # Security testing
├── wrappers/                # Contract wrappers
├── .github/workflows/       # CI/CD pipelines
└── README.md               # This file
```

## 🔧 **Development**

### **Build Commands**
```bash
# Build contracts
pnpm run build:contracts

# Build TypeScript
pnpm run build

# Clean build artifacts
pnpm run clean
```

### **Deployment**
```bash
# Deploy to testnet
pnpm run deploy:testnet

# Deploy to mainnet
pnpm run deploy:mainnet
```

## 📊 **Performance & Limits**

### **Scalability**
- **Maximum Winners**: 1,000 per room
- **Maximum Entry Fee**: 1,000 TON
- **Room ID Range**: 1 - 999,999,999
- **Date Range**: 2024-2030

### **Gas Optimization**
- **Efficient Storage**: Optimized data structures
- **Batch Operations**: Multiple operations in single transaction
- **Minimal State Changes**: Only necessary updates

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ **Disclaimer**

This software is provided "as is" without warranty. Users should conduct their own security audits and testing before using in production environments. The authors are not responsible for any financial losses or damages.

## 🔗 **Links**

- **FAE Arcade**: [Platform Website](https://fae-arcade.com)
- **TON Blockchain**: [Official Documentation](https://ton.org/docs)
- **Tact Language**: [Smart Contract Language](https://tact-lang.org)
- **Issues**: [GitHub Issues](https://github.com/your-org/fae-ton/issues)

---

**Built with ❤️ for the TON ecosystem** 