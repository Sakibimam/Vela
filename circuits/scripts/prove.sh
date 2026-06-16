#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

echo "╔══════════════════════════════════════════╗"
echo "║       Vela Sample Proof Generation       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Helper to generate witness + proof + verify
prove_circuit() {
    local circuit=$1
    local input_file=$2

    echo "━━━ Proving: $circuit ━━━"

    WASM_DIR="$BUILD_DIR/${circuit}_js"
    ZKEY="$BUILD_DIR/${circuit}_final.zkey"
    VKEY="$BUILD_DIR/${circuit}_vkey.json"

    if [ ! -f "$ZKEY" ]; then
        echo "ERROR: $ZKEY not found. Run setup.sh first."
        exit 1
    fi

    # Generate witness
    node "$WASM_DIR/generate_witness.js" "$WASM_DIR/$circuit.wasm" "$input_file" "$BUILD_DIR/${circuit}_witness.wtns"

    # Generate proof
    npx snarkjs groth16 prove "$ZKEY" "$BUILD_DIR/${circuit}_witness.wtns" \
        "$BUILD_DIR/${circuit}_proof.json" "$BUILD_DIR/${circuit}_public.json"

    # Verify proof
    npx snarkjs groth16 verify "$VKEY" "$BUILD_DIR/${circuit}_public.json" "$BUILD_DIR/${circuit}_proof.json"

    echo "Proof verified successfully!"
    echo ""
}

# Create sample inputs directory
INPUTS_DIR="$BUILD_DIR/inputs"
mkdir -p "$INPUTS_DIR"

# Sample input for amount_commitment (simplest to demo)
cat > "$INPUTS_DIR/amount_commitment_input.json" << 'EOF'
{
    "amount": "150000",
    "sender_secret": "123456789",
    "nonce": "987654321",
    "commitment": "0",
    "max_amount": "300000",
    "nullifier": "0"
}
EOF

echo "NOTE: Sample inputs use placeholder values for commitment/nullifier."
echo "      Run the test suite for proper end-to-end proof generation."
echo "      The test computes correct Poseidon hashes before proving."
echo ""

# Only prove if setup has been run
if [ -f "$BUILD_DIR/amount_commitment_final.zkey" ]; then
    echo "To generate a proper proof, use the test suite:"
    echo "  pnpm test"
    echo ""
    echo "Or compute hashes first with snarkjs/circomlib and update input files."
else
    echo "Setup not yet run. Execute in order:"
    echo "  1. bash scripts/compile.sh"
    echo "  2. bash scripts/setup.sh"
    echo "  3. bash scripts/prove.sh"
fi
