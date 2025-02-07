import { Beef } from './Beef.js'

/**
 * Extends `Beef` that is used to exchange transaction validity data with more than one external party.
 *
 * Use `addKnownTxidsForParty` to keep track of who knows what to reduce re-transmission of potentially large transactions.
 *
 * Use `getTrimmedBeefForParty` to obtain a `Beef` trimmed of transaction validity data known to a specific party.
 *
 * Typical usage scenario:
 *
 * 1. Query a wallet storage provider for spendable outputs.
 * 2. The provider replies with a Beef validating the returned outputs.
 * 3. Construct a new transaction using some of the queried outputs as inputs, including Beef validating all the inputs.
 * 4. Receive new valid raw transaction after processing and Beef validating change outputs added to original inputs.
 * 5. Return to step 1, continuing to build on old and new spendable outputs.
 *
 * By default, each Beef is required to be complete and valid: All transactions appear as full serialized bitcoin transactions and
 * each transaction either has a merkle path proof (it has been mined) or all of its input transactions are included.
 *
 * The size and redundancy of these Beefs becomes a problem when chained transaction creation out-paces the block mining rate.
 *
 */
export class BeefParty extends Beef {
  /**
   * keys are party identifiers.
   * values are records of txids with truthy value for which the party already has validity proof.
   */
  knownTo: Record<string, Record<string, boolean>> = {}

  /**
   *
   * @param parties Optional array of initial unique party identifiers.
   */
  constructor (parties?: string[]) {
    super()
    if (parties != null) {
      for (const party of parties) {
        this.addParty(party)
      }
    }
  }

  /**
   * @param party
   * @returns `true` if `party` has already been added to this `BeefParty`.
   */
  isParty (party: string): boolean {
    const r = Object.keys(this.knownTo).includes(party)
    return r
  }

  /**
   * Adds a new unique party identifier to this `BeefParty`.
   * @param party
   */
  addParty (party: string): void {
    if (this.isParty(party)) {
      throw new Error(`Party ${party} already exists.`)
    }
    this.knownTo[party] = {}
  }

  /**
   * @param party
   * @returns Array of txids "known" to `party`.
   */
  getKnownTxidsForParty (party: string): string[] {
    const knownTxids = this.knownTo[party]

    if (knownTxids === undefined) { // ✅ Explicitly check for undefined
      throw new Error(`Party ${party} is unknown.`)
    }

    return Object.keys(knownTxids)
  }

  /**
   * @param party
   * @returns trimmed beef of unknown transactions and proofs for `party`
   */
  getTrimmedBeefForParty (party: string): Beef {
    const knownTxids = this.getKnownTxidsForParty(party)
    const prunedBeef = this.clone()
    prunedBeef.trimKnownTxids(knownTxids)
    return prunedBeef
  }

  /**
   * Make note of additional txids "known" to `party`.
   * @param party unique identifier, added if new.
   * @param knownTxids
   */
  addKnownTxidsForParty (party: string, knownTxids: string[]): void {
    if (!this.isParty(party)) {
      this.addParty(party)
    }
    const kts = this.knownTo[party]
    for (const txid of knownTxids) {
      kts[txid] = true
      this.mergeTxidOnly(txid)
    }
  }

  /**
   * Merge a `beef` received from a specific `party`.
   *
   * Updates this `BeefParty` to track all the txids
   * corresponding to transactions for which `party`
   * has raw transaction and validity proof data.
   *
   * @param party
   * @param beef
   */
  mergeBeefFromParty (party: string, beef: number[] | Beef): void {
    const b: Beef = Array.isArray(beef) ? Beef.fromBinary(beef) : beef
    const knownTxids = b.getValidTxids()
    this.mergeBeef(b)
    this.addKnownTxidsForParty(party, knownTxids)
  }
}

export default BeefParty
