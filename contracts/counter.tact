import "@stdlib/deploy";

contract Counter {
    owner: Address;
    counter: Int as u32;
    
    init() {
        self.owner = self.sender;
        self.counter = 0;
    }
    
    // Increment counter
    receive("increment") {
        self.counter = self.counter + 1;
    }
    
    // Decrement counter
    receive("decrement") {
        self.counter = self.counter - 1;
    }
    
    // Get counter value
    get fun counter(): Int {
        return self.counter;
    }
    
    // Get owner
    get fun owner(): Address {
        return self.owner;
    }
} 