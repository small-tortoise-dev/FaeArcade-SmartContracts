# 🚀 FAE Arcade Treasury - Deployment Guide

## 📋 **Prerequisites**

Before deploying, ensure you have:

- ✅ **TON Wallet** with testnet coins (for testnet) or mainnet coins (for mainnet)
- ✅ **TON Center API Key** from [https://toncenter.com/](https://toncenter.com/)
- ✅ **Node.js 18+** and **pnpm 8+** installed
- ✅ **All tests passing** (`pnpm test`)

## 🔧 **Step 1: Environment Setup**

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   # Set your network
   NETWORK=testnet
   
   # Add your TON Center API key
   TONCENTER_API_KEY=your_api_key_here
   
   # Add your wallet mnemonic (24 words)
   MNEMONIC="your wallet mnemonic phrase here"
   ```

## 🚀 **Step 2: Deploy to Testnet**

1. **Build contracts:**
   ```bash
   pnpm run build:contracts
   ```

2. **Deploy Treasury:**
   ```bash
   pnpm run deploy:testnet
   ```

3. **Save the contract address** from the output to your `.env`:
   ```bash
   TREASURY_ADDRESS=EQ...your_deployed_address
   ```

## 🧪 **Step 3: Test Deployment**

1. **Test basic operations:**
   ```bash
   # Open a test room
   pnpm script scripts/openRoom.ts 12345 20241201 1.0 1
   
   # Enter the room
   pnpm script scripts/enterPaid.ts 12345 20241201
   
   # Close the room
   pnpm script scripts/closeRoom.ts 12345 20241201
   ```

2. **Test airdrop operations:**
   ```bash
   # Fund airdrop pool
   pnpm script scripts/fundAirdrop.ts 1.0
   
   # Distribute airdrop
   pnpm script scripts/payoutAirdrop.ts 5 3
   ```

## 🌐 **Step 4: Deploy to Mainnet**

⚠️ **WARNING: Only deploy to mainnet after thorough testing!**

1. **Update environment:**
   ```bash
   NETWORK=mainnet
   ```

2. **Ensure sufficient balance** (recommend 10+ TON for operations)

3. **Deploy:**
   ```bash
   pnpm run deploy:mainnet
   ```

## 📊 **Step 5: Post-Deployment**

1. **Verify contract state:**
   - Check owner and upgrade authority
   - Verify initial balance
   - Test all functions

2. **Monitor operations:**
   - Track room openings/closings
   - Monitor payout distributions
   - Watch airdrop operations

3. **Set up monitoring** (optional):
   - Contract balance alerts
   - Transaction monitoring
   - Error tracking

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Insufficient balance"**
   - Ensure wallet has enough TON for gas + operations
   - Testnet: Get coins from [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)

2. **"Invalid address"**
   - Check `.env` file format
   - Ensure no extra spaces or quotes

3. **"API key invalid"**
   - Verify TON Center API key
   - Check network endpoint URLs

### **Debug Mode:**
```bash
DEBUG=true pnpm run deploy:testnet
```

## 📚 **Next Steps**

After successful deployment:

1. **Create web interface** for users
2. **Set up monitoring** and alerts
3. **Document API** for developers
4. **Plan upgrade strategy**

## 🆘 **Support**

- **Issues**: [GitHub Issues](https://github.com/your-org/fae-ton/issues)
- **Documentation**: [README.md](README.md)
- **TON Community**: [Telegram](https://t.me/tonblockchain)

---

**🎉 Congratulations! Your FAE Arcade Treasury is now deployed and ready for production use!** 