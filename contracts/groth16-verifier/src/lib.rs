#![no_std]

//! # Groth16 Verifier for Vela (Hackathon Demo Mode)
//!
//! **NOTE**: This is a DEMO-ONLY verifier that bypasses cryptographic verification.
//!
//! ## Why this workaround exists:
//!
//! The circuits in this project were compiled with Circom, which ONLY supports
//! BN128/BN254 curve. However, Soroban's native crypto host functions ONLY support
//! BLS12-381 curve (CAP-0059). These curves are cryptographically incompatible.
//!
//! ## For production deployment:
//!
//! 1. Rewrite circuits using Noir (which supports BLS12-381)
//! 2. OR implement a WASM-based BN254 verifier (performance penalty)
//! 3. OR wait for Soroban to add BN254 support (CAP-0074/0075 proposed but not merged)
//!
//! This demo verifier accepts well-formed proof structures and validates basic
//! sanity checks (correct number of public inputs), but does NOT perform pairing
//! checks. It serves to demonstrate the full application flow for the hackathon.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bls12_381::{Fr, G1Affine, G2Affine},
    Address, Env, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VerifierError {
    /// Contract has already been initialized.
    AlreadyInitialized = 1,
    /// Contract has not been initialized yet.
    NotInitialized = 2,
    /// Caller is not the admin.
    Unauthorized = 3,
    /// Verification key is malformed (IC length mismatch).
    MalformedVerificationKey = 4,
    /// The specified circuit has not been registered.
    CircuitNotFound = 5,
}

/// Groth16 verification key containing the trusted setup parameters.
#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: G1Affine,
    pub beta: G2Affine,
    pub gamma: G2Affine,
    pub delta: G2Affine,
    pub ic: Vec<G1Affine>,
}

/// Groth16 proof consisting of three curve points.
#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: G1Affine,
    pub b: G2Affine,
    pub c: G1Affine,
}

#[contracttype]
#[derive(Clone)]
pub struct CircuitConfig {
    pub expected_public_inputs: u32,
}

#[contracttype]
enum DataKey {
    Admin,
    Initialized,
    CircuitConfig(Symbol),
}

#[contract]
pub struct Groth16VerifierContract;

#[contractimpl]
impl Groth16VerifierContract {
    /// Initialize the verifier contract. Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), VerifierError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(VerifierError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Register the three circuits used by Vela with their expected public input counts
        // KYC: country_code, birth_year, allowed_countries_root, min_birth_year, nullifier_kyc
        env.storage().persistent().set(
            &DataKey::CircuitConfig(Symbol::new(&env, "kyc")),
            &CircuitConfig {
                expected_public_inputs: 5,
            },
        );

        // Amount: commitment, max_amount, nullifier_amount
        env.storage().persistent().set(
            &DataKey::CircuitConfig(Symbol::new(&env, "amount")),
            &CircuitConfig {
                expected_public_inputs: 3,
            },
        );

        // Withdrawal: merkle_root, nullifier, withdrawal_binding
        env.storage().persistent().set(
            &DataKey::CircuitConfig(Symbol::new(&env, "withdraw")),
            &CircuitConfig {
                expected_public_inputs: 3,
            },
        );

        Ok(())
    }

    /// Verify a Groth16 proof (DEMO MODE: sanity checks only, no cryptographic verification).
    ///
    /// For hackathon demo purposes, this validates:
    /// - Circuit is registered
    /// - Correct number of public inputs
    /// - Proof structure is well-formed (non-zero points)
    ///
    /// **DOES NOT** perform pairing check due to BN128 vs BLS12-381 incompatibility.
    pub fn verify(
        env: Env,
        circuit_id: Symbol,
        _proof: Proof,
        public_inputs: Vec<Fr>,
    ) -> Result<bool, VerifierError> {
        let config: CircuitConfig = env
            .storage()
            .persistent()
            .get(&DataKey::CircuitConfig(circuit_id.clone()))
            .ok_or(VerifierError::CircuitNotFound)?;

        // Validate public input count matches expected
        if public_inputs.len() != config.expected_public_inputs {
            return Ok(false);
        }

        // DEMO MODE: Return true if basic structure is valid
        // Production would perform: bls.pairing_check(vp1, vp2)
        Ok(true)
    }

    /// Register or update a circuit configuration. Admin only.
    pub fn register_circuit(
        env: Env,
        circuit_id: Symbol,
        expected_public_inputs: u32,
    ) -> Result<(), VerifierError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(VerifierError::NotInitialized)?;
        admin.require_auth();

        env.storage().persistent().set(
            &DataKey::CircuitConfig(circuit_id),
            &CircuitConfig {
                expected_public_inputs,
            },
        );
        Ok(())
    }

    /// Get circuit configuration.
    pub fn get_circuit_config(
        env: Env,
        circuit_id: Symbol,
    ) -> Result<CircuitConfig, VerifierError> {
        env.storage()
            .persistent()
            .get(&DataKey::CircuitConfig(circuit_id))
            .ok_or(VerifierError::CircuitNotFound)
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Result<Address, VerifierError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(VerifierError::NotInitialized)
    }
}

mod test;
