import { PeerSession } from './types.js'

/**
 * Manages sessions for peers, allowing sessions to be added, retrieved, updated, and removed
 * by relevant identifiers (sessionNonce and peerIdentityKey).
 */
export class SessionManager {
  private readonly identifierToSession: Map<string, PeerSession>

  constructor () {
    this.identifierToSession = new Map<string, PeerSession>()
  }

  /**
   * Adds a session to the manager, associating it with relevant identifiers for retrieval.
   *
   * @param {PeerSession} session - The peer session to add.
   */
  addSession (session: PeerSession): void {
    if ((session.sessionNonce === null || session.sessionNonce === undefined || session.sessionNonce === '') &&
      (session.peerIdentityKey === null || session.peerIdentityKey === undefined || session.peerIdentityKey === '')) {
      throw new Error(
        'Invalid session: at least one of sessionNonce or peerIdentityKey is required.'
      )
    }

    if (session.sessionNonce !== null && session.sessionNonce !== undefined && session.sessionNonce !== '') {
      this.identifierToSession.set(session.sessionNonce, session)
    }
    if (session.peerIdentityKey !== null && session.peerIdentityKey !== undefined && session.peerIdentityKey !== '') {
      this.identifierToSession.set(session.peerIdentityKey, session)
    }
  }

  /**
   * Updates a session in the manager, ensuring that all identifiers are correctly associated.
   *
   * @param {PeerSession} session - The peer session to update.
   */
  updateSession (session: PeerSession): void {
    this.removeSession(session)
    this.addSession(session)
  }

  /**
   * Retrieves a session based on a given identifier.
   *
   * @param {string} identifier - The identifier for the session (sessionNonce or peerIdentityKey).
   * @returns {PeerSession | undefined} - The matching peer session, or undefined if not found.
   */
  getSession (identifier: string): PeerSession | undefined {
    return this.identifierToSession.get(identifier)
  }

  /**
   * Removes a session from the manager by clearing all associated identifiers.
   *
   * @param {PeerSession} session - The peer session to remove.
   */
  removeSession (session: PeerSession): void {
    if (session.sessionNonce !== null && session.sessionNonce !== undefined && session.sessionNonce !== '') {
      this.identifierToSession.delete(session.sessionNonce)
    }
    if (session.peerIdentityKey !== null && session.peerIdentityKey !== undefined && session.peerIdentityKey !== '') {
      this.identifierToSession.delete(session.peerIdentityKey)
    }
  }

  /**
   * Checks if a session exists based on a given identifier.
   *
   * @param {string} identifier - The identifier to check.
   * @returns {boolean} - True if the session exists, false otherwise.
   */
  hasSession (identifier: string): boolean {
    return this.identifierToSession.has(identifier)
  }
}
