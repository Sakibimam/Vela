pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template AmountCommitment() {
    // Private inputs
    signal input amount;
    signal input sender_secret;
    signal input nonce;

    // Public inputs
    signal input commitment;
    signal input max_amount;
    signal input nullifier;

    // 1. Prove commitment == Poseidon(amount, sender_secret, nonce)
    component commitHash = Poseidon(3);
    commitHash.inputs[0] <== amount;
    commitHash.inputs[1] <== sender_secret;
    commitHash.inputs[2] <== nonce;
    commitHash.out === commitment;

    // 2. Prove amount > 0
    component gtZero = GreaterThan(64);
    gtZero.in[0] <== amount;
    gtZero.in[1] <== 0;
    gtZero.out === 1;

    // 3. Prove amount <= max_amount
    component ltMax = LessEqThan(64);
    ltMax.in[0] <== amount;
    ltMax.in[1] <== max_amount;
    ltMax.out === 1;

    // 4. Prove nullifier == Poseidon(sender_secret, nonce)
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== sender_secret;
    nullifierHash.inputs[1] <== nonce;
    nullifierHash.out === nullifier;
}

component main {public [commitment, max_amount, nullifier]} = AmountCommitment();
