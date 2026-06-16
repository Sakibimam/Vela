#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

CIRCUITS=("kyc_compliance" "amount_commitment" "withdrawal")

PTAU_FILE="$BUILD_DIR/pot14_final.ptau"

echo "╔══════════════════════════════════════════╗"
echo "║       Vela Trusted Setup (dev)           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Download powers of tau if not present (2^14 = 16384 constraints max)
if [ ! -f "$PTAU_FILE" ]; then
    echo "Downloading Powers of Tau (BN128, 2^14)..."
    curl -L -o "$PTAU_FILE" \
        "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau"
    echo "Downloaded: $PTAU_FILE"
fi

echo ""

for circuit in "${CIRCUITS[@]}"; do
    echo "━━━ Setup: $circuit ━━━"

    R1CS="$BUILD_DIR/$circuit.r1cs"
    if [ ! -f "$R1CS" ]; then
        echo "ERROR: $R1CS not found. Run compile.sh first."
        exit 1
    fi

    # Generate zkey (Groth16)
    npx snarkjs groth16 setup "$R1CS" "$PTAU_FILE" "$BUILD_DIR/${circuit}_0000.zkey"

    # Contribute to ceremony (deterministic for dev)
    npx snarkjs zkey contribute "$BUILD_DIR/${circuit}_0000.zkey" "$BUILD_DIR/${circuit}_final.zkey" \
        --name="Vela dev contribution" -v -e="vela-dev-entropy-${circuit}"

    # Export verification key
    npx snarkjs zkey export verificationkey "$BUILD_DIR/${circuit}_final.zkey" "$BUILD_DIR/${circuit}_vkey.json"

    # Cleanup intermediate zkey
    rm -f "$BUILD_DIR/${circuit}_0000.zkey"

    echo "Generated: ${circuit}_final.zkey, ${circuit}_vkey.json"
    echo ""
done

echo "Trusted setup complete!"
echo "WARNING: This is a dev setup. Use a proper ceremony for production."
