#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register(SettlementContract, ());
    let client = SettlementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let policy = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin, &policy, &token);

    let stats = client.get_stats();
    assert_eq!(stats.total_locked, 0);
    assert_eq!(stats.total_released, 0);
    assert_eq!(stats.tx_count, 0);
}

#[test]
#[should_panic(expected = "AlreadyInitialized")]
fn test_double_initialize() {
    let env = Env::default();
    let contract_id = env.register(SettlementContract, ());
    let client = SettlementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let policy = Address::generate(&env);
    let token = Address::generate(&env);

    client.initialize(&admin, &policy, &token);
    client.initialize(&admin, &policy, &token);
}
