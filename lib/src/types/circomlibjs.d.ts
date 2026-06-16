declare module "circomlibjs" {
  interface PoseidonField {
    toObject(val: unknown): bigint;
  }

  interface PoseidonFunction {
    (inputs: bigint[]): Uint8Array;
    F: PoseidonField;
  }

  export function buildPoseidon(): Promise<PoseidonFunction>;
}
