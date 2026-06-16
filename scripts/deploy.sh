#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTRACTS_DIR="$ROOT_DIR/contracts"
ENV_FILE="$ROOT_DIR/.env"

echo "╔══════════════════════════════════════════╗"
echo "║       Vela Contract Deployment           ║"
echo "║       Network: Stellar Testnet           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check prerequisites
if ! command -v stellar &> /dev/null; then
    echo "ERROR: stellar CLI not found. Install via: cargo install stellar-cli --locked"
    exit 1
fi

# Configure network
NETWORK="testnet"
DEPLOYER_ALIAS="vela-deployer"

# Generate or use existing deployer identity
if ! stellar keys address "$DEPLOYER_ALIAS" &> /dev/null 2>&1; then
    echo "Generating deployer identity..."
    stellar keys generate "$DEPLOYER_ALIAS" --network "$NETWORK"
    echo "Funding deployer from friendbot..."
    stellar keys fund "$DEPLOYER_ALIAS" --network "$NETWORK"
else
    echo "Using existing deployer: $DEPLOYER_ALIAS"
fi

DEPLOYER_ADDRESS=$(stellar keys address "$DEPLOYER_ALIAS")
echo "Deployer: $DEPLOYER_ADDRESS"
echo ""

# Build contracts
echo "━━━ Building contracts ━━━"
cd "$CONTRACTS_DIR"
stellar contract build 2>&1
echo "Build complete."
echo ""

# Optimize WASMs
echo "━━━ Optimizing WASMs ━━━"
WASM_DIR="$CONTRACTS_DIR/target/wasm32-unknown-unknown/release"

for wasm in vela_groth16_verifier vela_settlement vela_corridor_policy; do
    if [ -f "$WASM_DIR/$wasm.wasm" ]; then
        stellar contract optimize --wasm "$WASM_DIR/$wasm.wasm" 2>&1 || true
        echo "Optimized: $wasm.wasm"
    fi
done
echo ""

# Deploy in order: verifier → settlement → corridor-policy
echo "━━━ Deploying: groth16-verifier ━━━"
VERIFIER_ID=$(stellar contract deploy \
    --wasm "$WASM_DIR/vela_groth16_verifier.wasm" \
    --source "$DEPLOYER_ALIAS" \
    --network "$NETWORK" 2>&1)
echo "Verifier deployed: $VERIFIER_ID"

# Initialize verifier
stellar contract invoke \
    --id "$VERIFIER_ID" \
    --source "$DEPLOYER_ALIAS" \
    --network "$NETWORK" \
    -- initialize --admin "$DEPLOYER_ADDRESS" 2>&1
echo "Verifier initialized."
echo ""

echo "━━━ Deploying: settlement ━━━"
SETTLEMENT_ID=$(stellar contract deploy \
    --wasm "$WASM_DIR/vela_settlement.wasm" \
    --source "$DEPLOYER_ALIAS" \
    --network "$NETWORK" 2>&1)
echo "Settlement deployed: $SETTLEMENT_ID"
echo ""

echo "━━━ Deploying: corridor-policy ━━━"
POLICY_ID=$(stellar contract deploy \
    --wasm "$WASM_DIR/vela_corridor_policy.wasm" \
    --source "$DEPLOYER_ALIAS" \
    --network "$NETWORK" 2>&1)
echo "Policy deployed: $POLICY_ID"
echo ""

# Write contract IDs to .env
echo "━━━ Writing .env ━━━"
cat > "$ENV_FILE" << EOF
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_VERIFIER_CONTRACT_ID=$VERIFIER_ID
NEXT_PUBLIC_POLICY_CONTRACT_ID=$POLICY_ID
NEXT_PUBLIC_SETTLEMENT_CONTRACT_ID=$SETTLEMENT_ID
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
DEPLOYER_ADDRESS=$DEPLOYER_ADDRESS
EOF

echo "Contract IDs written to .env"
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       Deployment Complete!               ║"
echo "╠══════════════════════════════════════════╣"
echo "║ Verifier:   $VERIFIER_ID"
echo "║ Settlement: $SETTLEMENT_ID"
echo "║ Policy:     $POLICY_ID"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Initialize settlement with policy contract ID"
echo "  2. Initialize corridor-policy with verifier + settlement IDs"
echo "  3. Register verification keys on the verifier"
