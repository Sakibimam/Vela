#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, Symbol};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(Groth16VerifierContract, ());
    let client = Groth16VerifierContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.get_admin(), admin);
}

#[test]
#[should_panic(expected = "AlreadyInitialized")]
fn test_double_initialize() {
    let env = Env::default();
    let contract_id = env.register(Groth16VerifierContract, ());
    let client = Groth16VerifierContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
    client.initialize(&admin);
}

#[test]
fn test_circuit_not_found() {
    let env = Env::default();
    let contract_id = env.register(Groth16VerifierContract, ());
    let client = Groth16VerifierContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let result = client.try_get_vk(&Symbol::new(&env, "unknown"));
    assert!(result.is_err());
}
