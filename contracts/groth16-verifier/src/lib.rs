#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bls12_381::{Fr, G1Affine, G2Affine},
    vec, Address, Env, Symbol, Vec,
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
enum DataKey {
    Admin,
    Initialized,
    Vk(Symbol),
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
        Ok(())
    }

    /// Register a verification key for a specific circuit. Admin only.
    pub fn register_vk(
        env: Env,
        circuit_id: Symbol,
        vk: VerificationKey,
    ) -> Result<(), VerifierError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(VerifierError::NotInitialized)?;
        admin.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::Vk(circuit_id), &vk);
        Ok(())
    }

    /// Verify a Groth16 proof against a registered circuit's verification key.
    ///
    /// Returns true if the proof is valid, false otherwise.
    /// Does NOT enforce any business rules — pure cryptographic verification.
    pub fn verify(
        env: Env,
        circuit_id: Symbol,
        proof: Proof,
        public_inputs: Vec<Fr>,
    ) -> Result<bool, VerifierError> {
        let vk: VerificationKey = env
            .storage()
            .persistent()
            .get(&DataKey::Vk(circuit_id))
            .ok_or(VerifierError::CircuitNotFound)?;

        if public_inputs.len() + 1 != vk.ic.len() {
            return Err(VerifierError::MalformedVerificationKey);
        }

        let bls = env.crypto().bls12_381();

        // Compute vk_x = IC[0] + sum(IC[i+1] * public_inputs[i])
        let mut vk_x: G1Affine = vk.ic.get(0).unwrap();
        for i in 0..public_inputs.len() {
            let signal = public_inputs.get(i).unwrap();
            let ic_point = vk.ic.get(i + 1).unwrap();
            let prod = bls.g1_mul(&ic_point, &signal);
            vk_x = bls.g1_add(&vk_x, &prod);
        }

        // Pairing check: e(-A, B) * e(alpha, beta) * e(vk_x, gamma) * e(C, delta) == 1
        let neg_a = -proof.a;
        let vp1 = vec![&env, neg_a, vk.alpha, vk_x, proof.c];
        let vp2 = vec![&env, proof.b, vk.beta, vk.gamma, vk.delta];

        Ok(bls.pairing_check(vp1, vp2))
    }

    /// Get the verification key for a specific circuit.
    pub fn get_vk(env: Env, circuit_id: Symbol) -> Result<VerificationKey, VerifierError> {
        env.storage()
            .persistent()
            .get(&DataKey::Vk(circuit_id))
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
