#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SettlementError {
    /// Contract has already been initialized.
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet.
    NotInitialized = 2,
    /// Caller is not the admin.
    Unauthorized = 3,
    /// Only the policy contract may call this function.
    OnlyPolicyContract = 4,
    /// Insufficient balance to release funds.
    InsufficientBalance = 5,
    /// Amount must be positive.
    InvalidAmount = 6,
}

/// Settlement statistics.
#[derive(Clone)]
#[contracttype]
pub struct Stats {
    pub total_locked: i128,
    pub total_released: i128,
    pub tx_count: u32,
}

#[contracttype]
enum DataKey {
    Admin,
    Initialized,
    PolicyContractId,
    TokenId,
    TotalLocked,
    TotalReleased,
    TxCount,
}

#[contract]
pub struct SettlementContract;

#[contractimpl]
impl SettlementContract {
    /// Initialize the settlement contract.
    ///
    /// - `admin`: contract administrator
    /// - `policy_id`: the corridor-policy contract allowed to lock/release funds
    /// - `token_id`: the USDC token contract address
    pub fn initialize(
        env: Env,
        admin: Address,
        policy_id: Address,
        token_id: Address,
    ) -> Result<(), SettlementError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(SettlementError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PolicyContractId, &policy_id);
        env.storage().instance().set(&DataKey::TokenId, &token_id);
        env.storage()
            .instance()
            .set(&DataKey::TotalLocked, &0i128);
        env.storage()
            .instance()
            .set(&DataKey::TotalReleased, &0i128);
        env.storage().instance().set(&DataKey::TxCount, &0u32);
        env.storage().instance().set(&DataKey::Initialized, &true);

        Ok(())
    }

    /// Lock funds from the sender into this contract's vault.
    ///
    /// Only callable by the policy contract.
    /// Transfers USDC from the sender to this contract.
    pub fn lock_funds(env: Env, from: Address, amount: i128) -> Result<(), SettlementError> {
        Self::require_policy(&env)?;

        if amount <= 0 {
            return Err(SettlementError::InvalidAmount);
        }

        from.require_auth();

        let token_id: Address = env.storage().instance().get(&DataKey::TokenId).unwrap();
        let token_client = token::Client::new(&env, &token_id);
        let contract_address = env.current_contract_address();

        token_client.transfer(&from, &contract_address, &amount);

        // Update stats
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLocked)
            .unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalLocked, &(total + amount));

        let count: u32 = env.storage().instance().get(&DataKey::TxCount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TxCount, &(count + 1));

        env.events().publish(
            (Symbol::new(&env, "lock"),),
            (from, amount),
        );

        Ok(())
    }

    /// Release funds from this contract's vault to the receiver.
    ///
    /// Only callable by the policy contract.
    /// Transfers USDC from this contract to the receiver.
    pub fn release_funds(env: Env, to: Address, amount: i128) -> Result<(), SettlementError> {
        Self::require_policy(&env)?;

        if amount <= 0 {
            return Err(SettlementError::InvalidAmount);
        }

        let token_id: Address = env.storage().instance().get(&DataKey::TokenId).unwrap();
        let token_client = token::Client::new(&env, &token_id);
        let contract_address = env.current_contract_address();

        let balance = token_client.balance(&contract_address);
        if balance < amount {
            return Err(SettlementError::InsufficientBalance);
        }

        token_client.transfer(&contract_address, &to, &amount);

        // Update stats
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalReleased)
            .unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalReleased, &(total + amount));

        env.events().publish(
            (Symbol::new(&env, "release"),),
            (to, amount),
        );

        Ok(())
    }

    /// Get the current USDC balance held by this contract.
    pub fn get_balance(env: Env) -> Result<i128, SettlementError> {
        let token_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenId)
            .ok_or(SettlementError::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_id);
        Ok(token_client.balance(&env.current_contract_address()))
    }

    /// Get settlement statistics (total locked, total released, transaction count).
    pub fn get_stats(env: Env) -> Result<Stats, SettlementError> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(SettlementError::NotInitialized);
        }

        Ok(Stats {
            total_locked: env
                .storage()
                .instance()
                .get(&DataKey::TotalLocked)
                .unwrap(),
            total_released: env
                .storage()
                .instance()
                .get(&DataKey::TotalReleased)
                .unwrap(),
            tx_count: env.storage().instance().get(&DataKey::TxCount).unwrap(),
        })
    }

    /// Update the policy contract address. Admin only.
    pub fn set_policy(env: Env, policy_id: Address) -> Result<(), SettlementError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(SettlementError::NotInitialized)?;
        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::PolicyContractId, &policy_id);
        Ok(())
    }

    /// Internal: verify the caller is the policy contract.
    fn require_policy(env: &Env) -> Result<(), SettlementError> {
        let policy_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::PolicyContractId)
            .ok_or(SettlementError::NotInitialized)?;
        policy_id.require_auth();
        Ok(())
    }
}

mod test;
