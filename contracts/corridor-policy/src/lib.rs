#![no_std]
#![allow(dead_code)]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bls12_381::Fr,
    Address, BytesN, Env, Symbol, Vec,
};

// Cross-contract call interfaces (no WASM import needed at compile time)
mod verifier_interface {
    use soroban_sdk::{contractclient, contracttype, crypto::bls12_381::{Fr, G1Affine, G2Affine}, Env, Symbol, Vec};

    #[contracttype]
    #[derive(Clone)]
    pub struct Proof {
        pub a: G1Affine,
        pub b: G2Affine,
        pub c: G1Affine,
    }

    #[contractclient(name = "VerifierClient")]
    pub trait VerifierInterface {
        fn verify(env: Env, circuit_id: Symbol, proof: Proof, public_inputs: Vec<Fr>) -> bool;
    }
}

mod settlement_interface {
    use soroban_sdk::{contractclient, Address, Env};

    #[contractclient(name = "SettlementClient")]
    pub trait SettlementInterface {
        fn lock_funds(env: Env, from: Address, amount: i128);
        fn release_funds(env: Env, to: Address, amount: i128);
    }
}

use verifier_interface::{Proof, VerifierClient};
use settlement_interface::SettlementClient;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PolicyError {
    /// Contract has already been initialized.
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet.
    NotInitialized = 2,
    /// Caller is not the admin.
    Unauthorized = 3,
    /// Corridor is paused.
    CorridorInactive = 4,
    /// KYC proof verification failed.
    KycProofInvalid = 5,
    /// Amount commitment proof verification failed.
    AmountProofInvalid = 6,
    /// Withdrawal proof verification failed.
    WithdrawalProofInvalid = 7,
    /// Nullifier has already been used (double-spend attempt).
    NullifierAlreadyUsed = 8,
    /// Merkle root mismatch.
    InvalidMerkleRoot = 9,
}

/// Configuration for the remittance corridor.
#[derive(Clone)]
#[contracttype]
pub struct CorridorConfig {
    pub max_amount: u64,
    pub allowed_countries_root: BytesN<32>,
    pub kyc_issuer_hash: BytesN<32>,
    pub is_active: bool,
}

#[contracttype]
enum DataKey {
    Admin,
    Initialized,
    VerifierContractId,
    SettlementContractId,
    Config,
    CommitmentCount,
    Commitment(u32),
    Nullifier(BytesN<32>),
}

#[contract]
pub struct CorridorPolicyContract;

#[contractimpl]
impl CorridorPolicyContract {
    /// Initialize the corridor policy contract.
    /// Must provide verifier and settlement contract addresses, plus corridor config.
    pub fn initialize(
        env: Env,
        admin: Address,
        verifier_id: Address,
        settlement_id: Address,
        config: CorridorConfig,
    ) -> Result<(), PolicyError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(PolicyError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::VerifierContractId, &verifier_id);
        env.storage()
            .instance()
            .set(&DataKey::SettlementContractId, &settlement_id);
        env.storage().instance().set(&DataKey::Config, &config);
        env.storage()
            .instance()
            .set(&DataKey::CommitmentCount, &0u32);
        env.storage().instance().set(&DataKey::Initialized, &true);

        Ok(())
    }

    /// Deposit funds into the corridor.
    ///
    /// Sender provides:
    /// - KYC proof + public inputs (proves compliance without revealing identity)
    /// - Amount proof + public inputs (proves amount is in valid range)
    /// - Encrypted payload (view-key-encrypted metadata for auditors)
    ///
    /// On success: stores commitment, marks nullifiers used, locks funds via settlement.
    /// Note: amount is NOT passed as a parameter — it is shielded inside the commitment.
    /// The settlement contract locks funds based on the token transfer amount in the same tx.
    pub fn deposit(
        env: Env,
        sender: Address,
        kyc_proof: Proof,
        kyc_public_inputs: Vec<Fr>,
        amount_proof: Proof,
        amount_public_inputs: Vec<Fr>,
        commitment: BytesN<32>,
        nullifier_kyc: BytesN<32>,
        nullifier_amount: BytesN<32>,
        encrypted_payload: BytesN<32>,
    ) -> Result<(), PolicyError> {
        sender.require_auth();

        let config: CorridorConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(PolicyError::NotInitialized)?;

        if !config.is_active {
            return Err(PolicyError::CorridorInactive);
        }

        // Check nullifiers haven't been used
        if env
            .storage()
            .persistent()
            .has(&DataKey::Nullifier(nullifier_kyc.clone()))
        {
            return Err(PolicyError::NullifierAlreadyUsed);
        }
        if env
            .storage()
            .persistent()
            .has(&DataKey::Nullifier(nullifier_amount.clone()))
        {
            return Err(PolicyError::NullifierAlreadyUsed);
        }

        // Verify KYC proof via cross-contract call to verifier
        let verifier_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::VerifierContractId)
            .unwrap();
        let verifier_client = VerifierClient::new(&env, &verifier_id);

        let kyc_valid = verifier_client.verify(
            &Symbol::new(&env, "kyc"),
            &kyc_proof,
            &kyc_public_inputs,
        );
        if !kyc_valid {
            return Err(PolicyError::KycProofInvalid);
        }

        // Verify amount commitment proof
        let amount_valid = verifier_client.verify(
            &Symbol::new(&env, "amount"),
            &amount_proof,
            &amount_public_inputs,
        );
        if !amount_valid {
            return Err(PolicyError::AmountProofInvalid);
        }

        // Mark nullifiers as used
        env.storage()
            .persistent()
            .set(&DataKey::Nullifier(nullifier_kyc.clone()), &true);
        env.storage()
            .persistent()
            .set(&DataKey::Nullifier(nullifier_amount.clone()), &true);

        // Store commitment
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CommitmentCount)
            .unwrap();
        env.storage()
            .persistent()
            .set(&DataKey::Commitment(count), &commitment);
        env.storage()
            .instance()
            .set(&DataKey::CommitmentCount, &(count + 1));

        // Lock funds via settlement contract
        // Demo: fixed amount of 10_000_000 stroops (1 XLM) per deposit.
        // Production would use the shielded amount from the commitment.
        let settlement_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::SettlementContractId)
            .unwrap();
        let settlement_client = SettlementClient::new(&env, &settlement_id);
        settlement_client.lock_funds(&sender, &10_000_000i128);

        // Emit deposit event with encrypted payload for auditors
        env.events().publish(
            (Symbol::new(&env, "deposit"), commitment),
            (nullifier_kyc, nullifier_amount, encrypted_payload),
        );

        Ok(())
    }

    /// Withdraw funds from the corridor.
    ///
    /// Receiver provides:
    /// - Withdrawal proof (proves knowledge of a commitment in the Merkle tree)
    /// - Nullifier (prevents double-withdrawal)
    /// - Withdrawal binding (Poseidon(receiver_secret, receiver_address_hash) from circuit output)
    ///
    /// Note: amount is NOT passed — it remains shielded. The settlement release is
    /// authorized by the valid proof; the amount is encoded in the commitment.
    pub fn withdraw(
        env: Env,
        receiver: Address,
        withdrawal_proof: Proof,
        withdrawal_public_inputs: Vec<Fr>,
        nullifier: BytesN<32>,
        withdrawal_binding: BytesN<32>,
    ) -> Result<(), PolicyError> {
        receiver.require_auth();

        let config: CorridorConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(PolicyError::NotInitialized)?;

        if !config.is_active {
            return Err(PolicyError::CorridorInactive);
        }

        // Check nullifier not used
        if env
            .storage()
            .persistent()
            .has(&DataKey::Nullifier(nullifier.clone()))
        {
            return Err(PolicyError::NullifierAlreadyUsed);
        }

        // Verify withdrawal proof
        let verifier_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::VerifierContractId)
            .unwrap();
        let verifier_client = VerifierClient::new(&env, &verifier_id);

        let valid = verifier_client.verify(
            &Symbol::new(&env, "withdraw"),
            &withdrawal_proof,
            &withdrawal_public_inputs,
        );
        if !valid {
            return Err(PolicyError::WithdrawalProofInvalid);
        }

        // Mark nullifier as used
        env.storage()
            .persistent()
            .set(&DataKey::Nullifier(nullifier.clone()), &true);

        // Release funds via settlement contract
        // Demo: fixed amount of 10_000_000 stroops (1 XLM) per withdrawal.
        // Production would derive amount from the shielded commitment via an encrypted channel.
        let settlement_id: Address = env
            .storage()
            .instance()
            .get(&DataKey::SettlementContractId)
            .unwrap();
        let settlement_client = SettlementClient::new(&env, &settlement_id);
        settlement_client.release_funds(&receiver, &10_000_000i128);

        // Emit withdrawal event with binding for off-chain verification
        env.events()
            .publish((Symbol::new(&env, "withdrawal"),), (nullifier, receiver, withdrawal_binding));

        Ok(())
    }

    /// Get the current commitment count (number of deposits).
    pub fn get_commitment_count(env: Env) -> Result<u32, PolicyError> {
        env.storage()
            .instance()
            .get(&DataKey::CommitmentCount)
            .ok_or(PolicyError::NotInitialized)
    }

    /// Check if a nullifier has been used.
    pub fn is_nullifier_used(env: Env, nullifier: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Nullifier(nullifier))
    }

    /// Get the corridor configuration.
    pub fn get_config(env: Env) -> Result<CorridorConfig, PolicyError> {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(PolicyError::NotInitialized)
    }

    /// Update corridor configuration. Admin only.
    pub fn update_config(env: Env, config: CorridorConfig) -> Result<(), PolicyError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PolicyError::NotInitialized)?;
        admin.require_auth();

        env.storage().instance().set(&DataKey::Config, &config);
        Ok(())
    }

    /// Pause or resume the corridor. Admin only.
    pub fn set_active(env: Env, active: bool) -> Result<(), PolicyError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PolicyError::NotInitialized)?;
        admin.require_auth();

        let mut config: CorridorConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(PolicyError::NotInitialized)?;
        config.is_active = active;
        env.storage().instance().set(&DataKey::Config, &config);
        Ok(())
    }
}

mod test;
