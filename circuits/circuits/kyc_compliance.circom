pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/switcher.circom";

// Verifies a Poseidon Merkle proof of depth LEVELS
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

template KycCompliance() {
    // Private inputs
    signal input country_code;
    signal input birth_year;
    signal input kyc_attestation;
    signal input user_secret;
    signal input merkle_path[8];
    signal input merkle_indices[8];

    // Public inputs
    signal input allowed_countries_root;
    signal input min_birth_year;
    signal input kyc_issuer_hash;
    signal input nullifier;
    signal input nonce;

    // 1. Prove country_code is in allowed countries Merkle tree
    component countryHash = Poseidon(1);
    countryHash.inputs[0] <== country_code;

    component merkleProof = PoseidonMerkleProof(8);
    merkleProof.leaf <== countryHash.out;
    for (var i = 0; i < 8; i++) {
        merkleProof.pathElements[i] <== merkle_path[i];
        merkleProof.pathIndices[i] <== merkle_indices[i];
    }
    merkleProof.root === allowed_countries_root;

    // 2. Prove birth_year <= min_birth_year (sender is old enough)
    // TODO [MEDIUM security]: reduce to LessEqThan(16) — 64 bits allows field overflow attacks
    component ageCheck = LessEqThan(64);
    ageCheck.in[0] <== birth_year;
    ageCheck.in[1] <== min_birth_year;
    ageCheck.out === 1;

    // 3. Prove kyc_attestation matches issuer commitment
    component attestationHash = Poseidon(2);
    attestationHash.inputs[0] <== kyc_attestation;
    attestationHash.inputs[1] <== user_secret;
    attestationHash.out === kyc_issuer_hash;

    // 4. Prove nullifier is correctly derived
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== user_secret;
    nullifierHash.inputs[1] <== nonce;
    nullifierHash.out === nullifier;
}

component main {public [allowed_countries_root, min_birth_year, kyc_issuer_hash, nullifier, nonce]} = KycCompliance();
