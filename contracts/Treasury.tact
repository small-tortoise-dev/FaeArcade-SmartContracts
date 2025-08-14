import "@stdlib/deploy";
import "./interfaces/Treasury.iface.tact";
import "./lib/LinearWeights.tact";

// FAE Arcade Treasury Contract
// Upgradeable contract for managing game rooms, payouts, and airdrops
contract Treasury {
    
    // Constants
    let HOUSE_FEE_BPS: int = 250; // 2.5% = 250 basis points
    let HOUSE_FEE_DENOMINATOR: int = 10000;
    
    // Risk tier constants
    let RISK_TIER_LOW: int = 100;    // Low risk: 100 winners
    let RISK_TIER_MEDIUM: int = 50;  // Medium risk: 50 winners  
    let RISK_TIER_HIGH: int = 20;    // High risk: 20 winners
    
    // State variables
    owner: Address;
    upgrade_authority: Address;
    
    // Treasury pools
    airdrop_pool: coins;
    
    // Room management
    rooms: map<uint256, RoomState>; // key: hash(room_id|day)
    
    // Events
    event EntryReceived;
    event PaidPayoutDone;
    event AirdropPayoutDone;
    
    // Room state structure
    struct RoomState {
        entry_fee: coins;
        winners_count: int;
        status: RoomStatus;
        pool_after_fee: coins;
        total_entries: int;
        paid_hash: uint256?;
    }
    
    // Room status enum
    enum RoomStatus {
        Open,    // Accepting entries
        Closed,  // No more entries, calculating results
        Paid     // Winners paid out
    }
    
    // Constructor
    init(owner: Address, upgrade_authority: Address) {
        self.owner = owner;
        self.upgrade_authority = upgrade_authority;
        self.airdrop_pool = 0;
    }
    
    // ===== EXTERNAL MESSAGE HANDLERS =====
    
    // Open a new room for the day
    // admin only
    receive("open_room") {
        let room_id: uint256 = self.sender;
        let day: uint32 = self.sender;
        let entry_fee: coins = self.sender;
        let tier: int = self.sender;
        
        // Access control: only owner can open rooms
        require(self.sender == self.owner, "Only owner can open rooms");
        
        // Validate tier and set winners count
        let winners_count: int = self.getWinnersCountByTier(tier);
        require(winners_count > 0, "Invalid risk tier");
        
        let room_key: uint256 = self.getRoomKey(room_id, day);
        
        // Check if room already exists
        require(!self.rooms[room_key], "Room already exists for this day");
        
        // Create new room state
        let room_state: RoomState = RoomState {
            entry_fee: entry_fee,
            winners_count: winners_count,
            status: RoomStatus.Open,
            pool_after_fee: 0,
            total_entries: 0,
            paid_hash: null
        };
        
        self.rooms[room_key] = room_state;
    }
    
    // User enters a paid room
    // payable by user
    receive("enter_paid") {
        let room_id: uint256 = self.sender;
        let day: uint32 = self.sender;
        
        let room_key: uint256 = self.getRoomKey(room_id, day);
        
        // Get room state
        let room_state: RoomState? = self.rooms[room_key];
        require(room_state, "Room does not exist");
        
        let room: RoomState = room_state!;
        
        // Require room is Open
        require(room.status == RoomStatus.Open, "Room is not accepting entries");
        
        // Require correct entry fee
        require(self.balance == room.entry_fee, "Incorrect entry fee");
        
        // Calculate house fee: entry_fee * 250 / 10000
        let house_fee: coins = self.calculateHouseFee(room.entry_fee);
        
        // Add to pool after fee: entry_fee * 9750 / 10000
        let pool_contribution: coins = room.entry_fee - house_fee;
        room.pool_after_fee = room.pool_after_fee + pool_contribution;
        
        // Increment entries
        room.total_entries = room.total_entries + 1;
        
        // Update room state
        self.rooms[room_key] = room;
        
        // Emit EntryReceived event
        self.emit(EntryReceived {
            room_id: room_id,
            day: day,
            user: self.sender,
            entry_fee: room.entry_fee,
            tier: self.getTierFromWinnersCount(room.winners_count)
        });
    }
    
    // Close a room (stop accepting entries)
    // admin only
    receive("close_room") {
        let room_id: uint256 = self.sender;
        let day: uint32 = self.sender;
        
        // Access control: only owner can close rooms
        require(self.sender == self.owner, "Only owner can close rooms");
        
        let room_key: uint256 = self.getRoomKey(room_id, day);
        
        // Get room state
        let room_state: RoomState? = self.rooms[room_key];
        require(room_state, "Room does not exist");
        
        let room: RoomState = room_state!;
        
        // Require room is Open
        require(room.status == RoomStatus.Open, "Room is not open");
        
        // Close room
        room.status = RoomStatus.Closed;
        self.rooms[room_key] = room;
    }
    
    // Payout winners for paid rooms
    // admin/bot only
    receive("payout_paid") {
        let room_id: uint256 = self.sender;
        let day: uint32 = self.sender;
        let winners: slice = self.sender;
        let weights: slice = self.sender;
        
        // Access control: only owner can payout
        require(self.sender == self.owner, "Only owner can payout");
        
        let room_key: uint256 = self.getRoomKey(room_id, day);
        
        // Get room state
        let room_state: RoomState? = self.rooms[room_key];
        require(room_state, "Room does not exist");
        
        let room: RoomState = room_state!;
        
        // Require Closed and not yet Paid
        require(room.status == RoomStatus.Closed, "Room must be closed");
        require(!room.paid_hash, "Room already paid out");
        
        // Decode winners and weights
        let winners_count: int = winners.remainingBits() / 267; // 267 bits per address
        let weights_count: int = weights.remainingBits() / 32;  // 32 bits per weight
        
        // Validate lengths
        require(winners_count == room.winners_count, "Winners count mismatch");
        require(weights_count == room.winners_count, "Weights count mismatch");
        
        // Calculate expected total weight: N(N+1)/2
        let expected_total_weight: int = self.calculateExpectedTotalWeight(room.winners_count);
        
        // Sum actual weights
        let actual_total_weight: int = 0;
        let weights_array: int[] = [];
        
        // Reset slice for reading
        let weights_slice: slice = weights;
        while (weights_slice.remainingBits() >= 32) {
            let weight: int = weights_slice.loadUint(32);
            weights_array.push(weight);
            actual_total_weight = actual_total_weight + weight;
        }
        
        // Validate total weight
        require(actual_total_weight == expected_total_weight, "Total weight mismatch");
        
        // Distribute payouts with linear weights
        let R: coins = room.pool_after_fee; // Pool after fee
        let total_payout: coins = 0;
        
        // Reset slice for reading winners
        let winners_slice: slice = winners;
        let winner_index: int = 0;
        
        while (winners_slice.remainingBits() >= 267 && winner_index < winners_count) {
            let winner_address: Address = winners_slice.loadAddress();
            let weight: int = weights_array[winner_index];
            
            // Calculate payout: (weight / total_weight) * pool
            let payout: coins = self.calculateWeightedPayout(weight, actual_total_weight, R);
            
            // Round to nanotons (already handled by coins type)
            if (payout > 0) {
                // Send payout (bounce-safe)
                self.send(winner_address, payout, "payout", null);
                total_payout = total_payout + payout;
            }
            
            winner_index = winner_index + 1;
        }
        
        // Handle dust by adding to top ranks (simplified - just track total payout)
        let dust: coins = R - total_payout;
        
        // Set status to Paid and set paid_hash
        room.status = RoomStatus.Paid;
        room.paid_hash = self.calculatePaidHash(room_id, day, winners, weights);
        self.rooms[room_key] = room;
        
        // Emit PaidPayoutDone event
        self.emit(PaidPayoutDone {
            room_id: room_id,
            day: day,
            winners_count: room.winners_count,
            total_payout: total_payout,
            house_fee: self.calculateHouseFee(room.entry_fee * room.total_entries)
        });
    }
    
    // Fund the airdrop pool
    // payable
    receive("fund_airdrop") {
        // Increase airdrop pool by msg.value
        self.airdrop_pool = self.airdrop_pool + self.balance;
    }
    
    // Payout weekly airdrop
    // admin/bot only
    receive("payout_airdrop") {
        let top: slice = self.sender;
        let streak: slice = self.sender;
        
        // Access control: only owner can payout airdrop
        require(self.sender == self.owner, "Only owner can payout airdrop");
        
        // Calculate half of airdrop pool
        let half: coins = self.airdrop_pool / 2;
        
        // Count top winners
        let top_count: int = 0;
        let top_slice: slice = top;
        while (top_slice.remainingBits() >= 267) {
            let _: Address = top_slice.loadAddress();
            top_count = top_count + 1;
        }
        
        // Count streak winners
        let streak_count: int = 0;
        let streak_slice: slice = streak;
        while (streak_slice.remainingBits() >= 267) {
            let _: Address = streak_slice.loadAddress();
            streak_count = streak_count + 1;
        }
        
        // Pay even split to top winners
        let top_payout: coins = 0;
        if (top_count > 0) {
            let top_per_winner: coins = half / top_count;
            top_slice = top; // Reset slice
            
            while (top_slice.remainingBits() >= 267) {
                let winner: Address = top_slice.loadAddress();
                if (top_per_winner > 0) {
                    self.send(winner, top_per_winner, "top_airdrop", null);
                    top_payout = top_payout + top_per_winner;
                }
            }
        }
        
        // Pay even split to streak winners
        let streak_payout: coins = 0;
        if (streak_count > 0) {
            let streak_per_winner: coins = half / streak_count;
            streak_slice = streak; // Reset slice
            
            while (streak_slice.remainingBits() >= 267) {
                let winner: Address = streak_slice.loadAddress();
                if (streak_per_winner > 0) {
                    self.send(winner, streak_per_winner, "streak_airdrop", null);
                    streak_payout = streak_payout + streak_per_winner;
                }
            }
        }
        
        // Zero out airdrop pool (or leave dust)
        self.airdrop_pool = 0;
        
        // Emit AirdropPayoutDone event
        self.emit(AirdropPayoutDone {
            top_winners_count: top_count,
            streak_winners_count: streak_count,
            top_payout: top_payout,
            streak_payout: streak_payout
        });
    }
    
    // Upgrade contract code
    // upgrade authority only
    receive("upgrade") {
        let new_code: cell = self.sender;
        
        // Protected by upgrade_authority
        require(self.sender == self.upgrade_authority, "Only upgrade authority can upgrade");
        
        // Upgrade logic would go here
        // For now, just a placeholder that preserves state
        self.upgradeContract(new_code);
    }
    
    // ===== HELPER FUNCTIONS =====
    
    // Getter functions for state
    get fun getOwner(): Address {
        return self.owner;
    }
    
    get fun getUpgradeAuthority(): Address {
        return self.upgrade_authority;
    }
    
    get fun getHouseFeeBps(): int {
        return HOUSE_FEE_BPS;
    }
    
    get fun getAirdropPool(): coins {
        return self.airdrop_pool;
    }
    
    get fun getRoomState(room_key: uint256): RoomState? {
        return self.rooms[room_key];
    }
    
    // Helper function to generate room key from room_id and day
    fun getRoomKey(room_id: uint256, day: uint32): uint256 {
        // Simple hash function - in production would use proper cryptographic hash
        return room_id + day;
    }
    
    // Helper function to calculate house fee
    fun calculateHouseFee(amount: coins): coins {
        return (amount * HOUSE_FEE_BPS) / HOUSE_FEE_DENOMINATOR;
    }
    
    // Helper function to get winners count by risk tier
    fun getWinnersCountByTier(tier: int): int {
        if (tier == 1) return RISK_TIER_LOW;
        if (tier == 2) return RISK_TIER_MEDIUM;
        if (tier == 3) return RISK_TIER_HIGH;
        return 0; // Invalid tier
    }
    
    // Helper function to get tier from winners count
    fun getTierFromWinnersCount(winners_count: int): int {
        if (winners_count == RISK_TIER_LOW) return 1;
        if (winners_count == RISK_TIER_MEDIUM) return 2;
        if (winners_count == RISK_TIER_HIGH) return 3;
        return 0; // Unknown tier
    }
    
    // Helper function to calculate expected total weight: N(N+1)/2
    fun calculateExpectedTotalWeight(n: int): int {
        return (n * (n + 1)) / 2;
    }
    
    // Helper function to calculate weighted payout
    fun calculateWeightedPayout(weight: int, total_weight: int, pool: coins): coins {
        if (total_weight == 0) return 0;
        return (weight * pool) / total_weight;
    }
    
    // Helper function to calculate paid hash
    fun calculatePaidHash(room_id: uint256, day: uint32, winners: slice, weights: slice): uint256 {
        // Simple hash calculation - in production would use proper cryptographic hash
        // This is a placeholder that combines inputs
        return room_id + day + winners.remainingBits() + weights.remainingBits();
    }
    
    // Placeholder for upgrade functionality
    // This would be implemented with proper upgrade logic
    fun upgradeContract(new_code: cell) {
        // Upgrade logic would go here
        // For now, just a placeholder
    }
} 