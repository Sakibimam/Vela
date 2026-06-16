import { assert } from "chai";
import path from "path";
import { fileURLToPath } from "url";
import { buildPoseidon } from "circomlibjs";
import { wasm as wasmTester } from "circom_tester";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const circuitsDir = path.join(__dirname, "..", "circuits");

let poseidon;
let F;

function poseidonHash(inputs) {
  return F.toObject(poseidon(inputs));
}

// Build a Merkle tree from leaves using Poseidon
function buildMerkleTree(leaves, depth) {
  const layers = [leaves.map((l) => l)];

  // Pad to 2^depth
  const size = 2 ** depth;
  while (layers[0].length < size) {
    layers[0].push(BigInt(0));
  }

  for (let i = 0; i < depth; i++) {
    const prev = layers[i];
    const curr = [];
    for (let j = 0; j < prev.length; j += 2) {
      curr.push(poseidonHash([prev[j], prev[j + 1]]));
    }
    layers.push(curr);
  }

  return layers;
}

function getMerkleProof(layers, index) {
  const pathElements = [];
  const pathIndices = [];

  for (let i = 0; i < layers.length - 1; i++) {
    const isRight = index % 2;
    const siblingIndex = isRight ? index - 1 : index + 1;
    pathElements.push(layers[i][siblingIndex] || BigInt(0));
    pathIndices.push(isRight ? 1 : 0);
    index = Math.floor(index / 2);
  }

  return { pathElements, pathIndices };
}

describe("Vela ZK Circuits", function () {
  this.timeout(120000);

  before(async function () {
    poseidon = await buildPoseidon();
    F = poseidon.F;
  });

  describe("Amount Commitment Circuit", function () {
    let circuit;

    before(async function () {
      circuit = await wasmTester(
        path.join(circuitsDir, "amount_commitment.circom"),
        { include: [path.join(__dirname, "..", "node_modules")] }
      );
    });

    it("should prove valid amount commitment", async function () {
      const amount = BigInt(150000);
      const senderSecret = BigInt(123456789);
      const nonce = BigInt(987654321);
      const maxAmount = BigInt(300000);

      const commitment = poseidonHash([amount, senderSecret, nonce]);
      const nullifier = poseidonHash([senderSecret, nonce]);

      const input = {
        amount: amount.toString(),
        sender_secret: senderSecret.toString(),
        nonce: nonce.toString(),
        commitment: commitment.toString(),
        max_amount: maxAmount.toString(),
        nullifier: nullifier.toString(),
      };

      const witness = await circuit.calculateWitness(input, true);
      await circuit.checkConstraints(witness);
    });

    it("should reject amount exceeding max", async function () {
      const amount = BigInt(500000); // over max
      const senderSecret = BigInt(123456789);
      const nonce = BigInt(987654321);
      const maxAmount = BigInt(300000);

      const commitment = poseidonHash([amount, senderSecret, nonce]);
      const nullifier = poseidonHash([senderSecret, nonce]);

      const input = {
        amount: amount.toString(),
        sender_secret: senderSecret.toString(),
        nonce: nonce.toString(),
        commitment: commitment.toString(),
        max_amount: maxAmount.toString(),
        nullifier: nullifier.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });

    it("should reject zero amount", async function () {
      const amount = BigInt(0);
      const senderSecret = BigInt(123456789);
      const nonce = BigInt(987654321);
      const maxAmount = BigInt(300000);

      const commitment = poseidonHash([amount, senderSecret, nonce]);
      const nullifier = poseidonHash([senderSecret, nonce]);

      const input = {
        amount: amount.toString(),
        sender_secret: senderSecret.toString(),
        nonce: nonce.toString(),
        commitment: commitment.toString(),
        max_amount: maxAmount.toString(),
        nullifier: nullifier.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });

    it("should reject wrong commitment", async function () {
      const amount = BigInt(150000);
      const senderSecret = BigInt(123456789);
      const nonce = BigInt(987654321);
      const maxAmount = BigInt(300000);

      const wrongCommitment = BigInt(999999);
      const nullifier = poseidonHash([senderSecret, nonce]);

      const input = {
        amount: amount.toString(),
        sender_secret: senderSecret.toString(),
        nonce: nonce.toString(),
        commitment: wrongCommitment.toString(),
        max_amount: maxAmount.toString(),
        nullifier: nullifier.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });
  });

  describe("KYC Compliance Circuit", function () {
    let circuit;

    before(async function () {
      circuit = await wasmTester(
        path.join(circuitsDir, "kyc_compliance.circom"),
        { include: [path.join(__dirname, "..", "node_modules")] }
      );
    });

    it("should prove valid KYC compliance", async function () {
      const countryCode = BigInt(840); // USA
      const birthYear = BigInt(1990);
      const kycAttestation = BigInt(111222333);
      const userSecret = BigInt(444555666);
      const nonce = BigInt(777888999);
      const minBirthYear = BigInt(2008); // must be born <= 2008

      // Hash the country code to get leaf
      const countryLeaf = poseidonHash([countryCode]);

      // Build Merkle tree of allowed countries
      const allowedCountries = [
        BigInt(840),
        BigInt(826),
        BigInt(276),
        BigInt(250),
      ]; // USA, UK, DE, FR
      const countryLeaves = allowedCountries.map((c) => poseidonHash([c]));
      const layers = buildMerkleTree(countryLeaves, 8);
      const { pathElements, pathIndices } = getMerkleProof(layers, 0); // USA is at index 0

      const allowedCountriesRoot = layers[layers.length - 1][0];

      // KYC issuer hash = Poseidon(attestation, user_secret)
      const kycIssuerHash = poseidonHash([kycAttestation, userSecret]);

      // Nullifier = Poseidon(user_secret, nonce)
      const nullifier = poseidonHash([userSecret, nonce]);

      const input = {
        country_code: countryCode.toString(),
        birth_year: birthYear.toString(),
        kyc_attestation: kycAttestation.toString(),
        user_secret: userSecret.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        allowed_countries_root: allowedCountriesRoot.toString(),
        min_birth_year: minBirthYear.toString(),
        kyc_issuer_hash: kycIssuerHash.toString(),
        nullifier: nullifier.toString(),
        nonce: nonce.toString(),
      };

      const witness = await circuit.calculateWitness(input, true);
      await circuit.checkConstraints(witness);
    });

    it("should reject underage sender", async function () {
      const countryCode = BigInt(840);
      const birthYear = BigInt(2010); // too young — born after 2008
      const kycAttestation = BigInt(111222333);
      const userSecret = BigInt(444555666);
      const nonce = BigInt(777888999);
      const minBirthYear = BigInt(2008);

      const countryLeaves = [BigInt(840), BigInt(826), BigInt(276), BigInt(250)].map((c) => poseidonHash([c]));
      const layers = buildMerkleTree(countryLeaves, 8);
      const { pathElements, pathIndices } = getMerkleProof(layers, 0);
      const allowedCountriesRoot = layers[layers.length - 1][0];
      const kycIssuerHash = poseidonHash([kycAttestation, userSecret]);
      const nullifier = poseidonHash([userSecret, nonce]);

      const input = {
        country_code: countryCode.toString(),
        birth_year: birthYear.toString(),
        kyc_attestation: kycAttestation.toString(),
        user_secret: userSecret.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        allowed_countries_root: allowedCountriesRoot.toString(),
        min_birth_year: minBirthYear.toString(),
        kyc_issuer_hash: kycIssuerHash.toString(),
        nullifier: nullifier.toString(),
        nonce: nonce.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });

    it("should reject disallowed country", async function () {
      const countryCode = BigInt(408); // North Korea — not in allowed list
      const birthYear = BigInt(1990);
      const kycAttestation = BigInt(111222333);
      const userSecret = BigInt(444555666);
      const nonce = BigInt(777888999);
      const minBirthYear = BigInt(2008);

      // Build tree with allowed countries (no 408)
      const countryLeaves = [BigInt(840), BigInt(826), BigInt(276), BigInt(250)].map((c) => poseidonHash([c]));
      const layers = buildMerkleTree(countryLeaves, 8);
      // Try to use a proof for index 0 (USA) but with NK country code
      const { pathElements, pathIndices } = getMerkleProof(layers, 0);
      const allowedCountriesRoot = layers[layers.length - 1][0];
      const kycIssuerHash = poseidonHash([kycAttestation, userSecret]);
      const nullifier = poseidonHash([userSecret, nonce]);

      const input = {
        country_code: countryCode.toString(),
        birth_year: birthYear.toString(),
        kyc_attestation: kycAttestation.toString(),
        user_secret: userSecret.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        allowed_countries_root: allowedCountriesRoot.toString(),
        min_birth_year: minBirthYear.toString(),
        kyc_issuer_hash: kycIssuerHash.toString(),
        nullifier: nullifier.toString(),
        nonce: nonce.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });
  });

  describe("Withdrawal Circuit", function () {
    let circuit;

    before(async function () {
      circuit = await wasmTester(
        path.join(circuitsDir, "withdrawal.circom"),
        { include: [path.join(__dirname, "..", "node_modules")] }
      );
    });

    it("should prove valid withdrawal", async function () {
      const amount = BigInt(150000);
      const receiverSecret = BigInt(555666777);
      const nonce = BigInt(111222333);
      const receiverAddressHash = BigInt(999888777);

      // Compute leaf
      const leaf = poseidonHash([amount, receiverSecret, nonce]);

      // Build Merkle tree with this commitment
      const otherLeaves = [BigInt(1), BigInt(2), BigInt(3)].map((x) =>
        poseidonHash([x, x, x])
      );
      const allLeaves = [leaf, ...otherLeaves];
      const layers = buildMerkleTree(allLeaves, 8);
      const { pathElements, pathIndices } = getMerkleProof(layers, 0);
      const merkleRoot = layers[layers.length - 1][0];

      // Nullifier
      const nullifier = poseidonHash([receiverSecret, nonce]);

      const input = {
        amount: amount.toString(),
        receiver_secret: receiverSecret.toString(),
        nonce: nonce.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        merkle_root: merkleRoot.toString(),
        nullifier: nullifier.toString(),
        receiver_address_hash: receiverAddressHash.toString(),
      };

      const witness = await circuit.calculateWitness(input, true);
      await circuit.checkConstraints(witness);
    });

    it("should reject wrong Merkle root", async function () {
      const amount = BigInt(150000);
      const receiverSecret = BigInt(555666777);
      const nonce = BigInt(111222333);
      const receiverAddressHash = BigInt(999888777);

      const leaf = poseidonHash([amount, receiverSecret, nonce]);
      const allLeaves = [leaf];
      const layers = buildMerkleTree(allLeaves, 8);
      const { pathElements, pathIndices } = getMerkleProof(layers, 0);

      // Wrong root
      const wrongRoot = BigInt(12345);
      const nullifier = poseidonHash([receiverSecret, nonce]);

      const input = {
        amount: amount.toString(),
        receiver_secret: receiverSecret.toString(),
        nonce: nonce.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        merkle_root: wrongRoot.toString(),
        nullifier: nullifier.toString(),
        receiver_address_hash: receiverAddressHash.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });

    it("should reject wrong nullifier", async function () {
      const amount = BigInt(150000);
      const receiverSecret = BigInt(555666777);
      const nonce = BigInt(111222333);
      const receiverAddressHash = BigInt(999888777);

      const leaf = poseidonHash([amount, receiverSecret, nonce]);
      const allLeaves = [leaf];
      const layers = buildMerkleTree(allLeaves, 8);
      const { pathElements, pathIndices } = getMerkleProof(layers, 0);
      const merkleRoot = layers[layers.length - 1][0];

      // Wrong nullifier
      const wrongNullifier = BigInt(99999);

      const input = {
        amount: amount.toString(),
        receiver_secret: receiverSecret.toString(),
        nonce: nonce.toString(),
        merkle_path: pathElements.map((e) => e.toString()),
        merkle_indices: pathIndices.map((i) => i.toString()),
        merkle_root: merkleRoot.toString(),
        nullifier: wrongNullifier.toString(),
        receiver_address_hash: receiverAddressHash.toString(),
      };

      try {
        await circuit.calculateWitness(input, true);
        assert.fail("Should have thrown");
      } catch (err) {
        assert.include(err.message, "Assert Failed");
      }
    });
  });
});
