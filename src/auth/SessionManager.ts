import { PeerSession } from './types.js'

/**
 * Manages sessions for peers, allowing multiple concurrent sessions
 * per identity key. Primary lookup is always by `sessionNonce`.
 */
export class SessionManager {
  /**
   * Maps sessionNonce -> PeerSession
   */
  private readonly sessionNonceToSession: Map<string, PeerSession>

  /**
   * Maps identityKey -> Set of sessionNonces
   */
  private readonly identityKeyToNonces: Map<string, Set<string>>

  constructor () {
    this.sessionNonceToSession = new Map<string, PeerSession>()
    this.identityKeyToNonces = new Map<string, Set<string>>()
  }

  /**
   * Adds a session to the manager, associating it with its sessionNonce,
   * and also with its peerIdentityKey (if any).
   *
   * This does NOT overwrite existing sessions for the same peerIdentityKey,
   * allowing multiple concurrent sessions for the same peer.
   *
   * @param {PeerSession} session - The peer session to add.
   */
  addSession (session: PeerSession): void {
    if (typeof session.sessionNonce !== 'string') {
      throw new Error(
        'Invalid session: sessionNonce is required to add a session.'
      )
    }

    // Use the sessionNonce as the primary key
    this.sessionNonceToSession.set(session.sessionNonce, session)

    // Also track it by identity key if present
    if (typeof session.peerIdentityKey === 'string') {
      let nonces = this.identityKeyToNonces.get(session.peerIdentityKey)
      if (nonces == null) {
        nonces = new Set<string>()
        this.identityKeyToNonces.set(session.peerIdentityKey, nonces)
      }
      nonces.add(session.sessionNonce)
    }
  }

  /**
   * Updates a session in the manager (primarily by re-adding it),
   * ensuring we record the latest data (e.g., isAuthenticated, lastUpdate, etc.).
   *
   * @param {PeerSession} session - The peer session to update.
   */
  updateSession (session: PeerSession): void {
    // Remove the old references (if any) and re-add
    this.removeSession(session)
    this.addSession(session)
  }

  /**
   * Retrieves a session based on a given identifier, which can be:
   *  - A sessionNonce, or
   *  - A peerIdentityKey.
   *
   * If it is a `sessionNonce`, returns that exact session.
   * If it is a `peerIdentityKey`, returns the "best" (e.g. most recently updated,
   * authenticated) session associated with that peer, if any.
   *
   * @param {string} identifier - The identifier for the session (sessionNonce or peerIdentityKey).
   * @returns {PeerSession | undefined} - The matching peer session, or undefined if not found.
   */
  getSession (identifier: string): PeerSession | undefined {
    // Check if this identifier is directly a sessionNonce
    const direct = this.sessionNonceToSession.get(identifier)
    if (direct != null) {
      return direct
    }

    // Otherwise, interpret the identifier as an identity key
    const nonces = this.identityKeyToNonces.get(identifier)
    if ((nonces == null) || nonces.size === 0) {
      return undefined
    }

    // Pick the "best" session. One sensible approach:
    // - Choose an authenticated session if available
    // - Among them, pick the most recently updated
    let best: PeerSession | undefined
    for (const nonce of nonces) {
      const s = this.sessionNonceToSession.get(nonce)
      if (s == null) continue
      // We can prefer authenticated sessions
      if (best == null) {
        best = s
      } else {
        // If we want the "most recently updated" AND isAuthenticated
        if ((s.lastUpdate ?? 0) > (best.lastUpdate ?? 0)) {
          best = s
        }
      }
    }
    // Optionally, you could also filter out isAuthenticated===false if you only want
    // an authenticated session. But for our usage, let's return the latest any session.
    return best
  }

  /**
   * Removes a session from the manager by clearing all associated identifiers.
   *
   * @param {PeerSession} session - The peer session to remove.
   */
  removeSession (session: PeerSession): void {
    if (typeof session.sessionNonce === 'string') {
      this.sessionNonceToSession.delete(session.sessionNonce)
    }
    if (typeof session.peerIdentityKey === 'string') {
      const nonces = this.identityKeyToNonces.get(session.peerIdentityKey)
      if (nonces != null) {
        nonces.delete(session.sessionNonce ?? '')
        if (nonces.size === 0) {
          this.identityKeyToNonces.delete(session.peerIdentityKey)
        }
      }
    }
  }

  /**
   * Checks if a session exists for a given identifier (either sessionNonce or identityKey).
   *
   * @param {string} identifier - The identifier to check.
   * @returns {boolean} - True if the session exists, false otherwise.
   */
  hasSession (identifier: string): boolean {
    const direct = this.sessionNonceToSession.has(identifier)
    if (direct) return true
    // if not directly a nonce, interpret as identityKey
    const nonces = this.identityKeyToNonces.get(identifier)
    return !(nonces == null) && nonces.size > 0
  }
}
