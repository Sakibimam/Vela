#!/bin/bash
set -e

echo "╔══════════════════════════════════════════╗"
echo "║    Vela Testnet Account Setup            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

NETWORK="testnet"

# Create and fund test accounts
ACCOUNTS=("vela-deployer" "vela-sender" "vela-receiver" "vela-auditor")

for account in "${ACCOUNTS[@]}"; do
    echo "━━━ $account ━━━"

    if stellar keys address "$account" &> /dev/null 2>&1; then
        echo "  Already exists: $(stellar keys address "$account")"
    else
        stellar keys generate "$account" --network "$NETWORK"
        echo "  Created: $(stellar keys address "$account")"
    fi

    echo "  Funding from friendbot..."
    stellar keys fund "$account" --network "$NETWORK" 2>&1 || echo "  (already funded or friendbot unavailable)"
    echo ""
done

echo "All accounts ready."
echo ""
echo "Addresses:"
for account in "${ACCOUNTS[@]}"; do
    echo "  $account: $(stellar keys address "$account" 2>/dev/null || echo 'not generated')"
done
