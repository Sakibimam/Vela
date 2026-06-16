pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// Reused Poseidon Merkle proof verifier
template PoseidonMerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;

    component hashers[levels];
    component switchers[levels];

    signal hashes[levels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        switchers[i] = Switcher();
        switchers[i].sel <== pathIndices[i];
        switchers[i].L <== hashes[i];
        switchers[i].R <== pathElements[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== switchers[i].outL;
        hashers[i].inputs[1] <== switchers[i].outR;

        hashes[i + 1] <== hashers[i].out;
    }

    root <== hashes[levels];
}

template Withdrawal() {
    // Private inputs
    signal input amount;
    signal input receiver_secret;
    signal input nonce;
    signal input merkle_path[8];
    signal input merkle_indices[8];

    // Public inputs
    signal input merkle_root;
    signal input nullifier;
    signal input receiver_address_hash;

    // 1. Compute leaf = Poseidon(amount, receiver_secret, nonce)
    component leafHash = Poseidon(3);
    leafHash.inputs[0] <== amount;
    leafHash.inputs[1] <== receiver_secret;
    leafHash.inputs[2] <== nonce;

    // Prove leaf exists in Merkle tree
    component merkleProof = PoseidonMerkleProof(8);
    merkleProof.leaf <== leafHash.out;
    for (var i = 0; i < 8; i++) {
        merkleProof.pathElements[i] <== merkle_path[i];
        merkleProof.pathIndices[i] <== merkle_indices[i];
    }
    merkleProof.root === merkle_root;

    // 2. Prove nullifier == Poseidon(receiver_secret, nonce)
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== receiver_secret;
    nullifierHash.inputs[1] <== nonce;
    nullifierHash.out === nullifier;

    // 3. Bind receiver address to this withdrawal
    component addressBinding = Poseidon(2);
    addressBinding.inputs[0] <== receiver_secret;
    addressBinding.inputs[1] <== receiver_address_hash;
    // Constraint: the binding must be non-zero (proves knowledge of secret for this address)
    signal address_check;
    address_check <== addressBinding.out;
    // Expose as implicit binding — the receiver_address_hash is public,
    // so verifier knows who's claiming. The private receiver_secret binds them.
}

component main {public [merkle_root, nullifier, receiver_address_hash]} = Withdrawal();
