#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
CIRCUITS_DIR="$ROOT_DIR/circuits"

mkdir -p "$BUILD_DIR"

CIRCUITS=("kyc_compliance" "amount_commitment" "withdrawal")

echo "╔══════════════════════════════════════════╗"
echo "║       Vela Circuit Compilation           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

for circuit in "${CIRCUITS[@]}"; do
    echo "━━━ Compiling: $circuit ━━━"
    circom "$CIRCUITS_DIR/$circuit.circom" \
        --r1cs \
        --wasm \
        --sym \
        -o "$BUILD_DIR" \
        -l "$ROOT_DIR/node_modules"

    # Print constraint count
    if command -v snarkjs &> /dev/null; then
        echo "Constraints:"
        npx snarkjs r1cs info "$BUILD_DIR/$circuit.r1cs"
    fi
    echo ""
done

echo "All circuits compiled successfully!"
echo "Artifacts in: $BUILD_DIR/"
