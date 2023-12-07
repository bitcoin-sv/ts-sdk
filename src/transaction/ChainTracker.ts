/**
 * The Chain Tracker is responsible for verifying the validity of a given Merkle root
 * for a specific block height within the blockchain.
 *
 * Chain Trackers ensure the integrity of the blockchain by
 * validating new headers against the chain's history. They use accumulated
 * proof-of-work and protocol adherence as metrics to assess the legitimacy of blocks.
 *
 * @interface ChainTracker
 * @function isValidRootForHeight - A method to verify the validity of a Merkle root
 *          for a given block height.
 *
 * @example
 * const chainTracker = {
 *   isValidRootForHeight: async (root, height) => {
 *     // Implementation to check if the Merkle root is valid for the specified block height.
 *   }
 * };
 */
export default interface ChainTracker {
  isValidRootForHeight: (root: string, height: number) => Promise<boolean>
}
