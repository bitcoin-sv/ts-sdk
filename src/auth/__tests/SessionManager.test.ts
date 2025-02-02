import { SessionManager } from "../SessionManager";
import { PeerSession } from "../types";

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let validSession: PeerSession;

  beforeEach(() => {
    sessionManager = new SessionManager();
    validSession = {
      isAuthenticated: false,
      sessionNonce: "testSessionNonce",
      peerIdentityKey: "testPeerIdentityKey",
    } as PeerSession;
  });

  describe("addSession", () => {
    it("should add a session when sessionNonce and peerIdentityKey are present", () => {
      sessionManager.addSession(validSession);

      if (validSession.sessionNonce) {
        expect(sessionManager.getSession(validSession.sessionNonce)).toBe(
          validSession
        );
      }
      if (validSession.peerIdentityKey) {
        expect(sessionManager.getSession(validSession.peerIdentityKey)).toBe(
          validSession
        );
      }
    });

    it("should throw an error if sessionNonce and peerIdentityKey are missing", () => {
      const invalidSession = {
        ...validSession,
        sessionNonce: undefined,
        peerIdentityKey: undefined,
      };

      expect(() => sessionManager.addSession(invalidSession)).toThrow(
        "Invalid session: at least one of sessionNonce or peerIdentityKey is required."
      );
    });

    it("should not throw an error if just peerIdentityKey is missing", () => {
      const invalidSession = { ...validSession, peerIdentityKey: undefined };

      expect(() => sessionManager.addSession(invalidSession)).not.toThrow(
        "Invalid session: peerIdentityKey is required."
      );
    });
  });

  describe("getSession", () => {
    it("should retrieve a session by sessionNonce", () => {
      sessionManager.addSession(validSession);

      if (validSession.sessionNonce) {
        const retrievedSession = sessionManager.getSession(
          validSession.sessionNonce
        );
        expect(retrievedSession).toBe(validSession);
      }
    });

    it("should retrieve a session by peerIdentityKey", () => {
      sessionManager.addSession(validSession);

      if (validSession.peerIdentityKey) {
        const retrievedSession = sessionManager.getSession(
          validSession.peerIdentityKey
        );
        expect(retrievedSession).toBe(validSession);
      }
    });

    it("should return undefined for a non-existent identifier", () => {
      const retrievedSession = sessionManager.getSession(
        "nonExistentIdentifier"
      );
      expect(retrievedSession).toBeUndefined();
    });
  });

  describe("removeSession", () => {
    it("should remove a session by both sessionNonce and peerIdentityKey", () => {
      sessionManager.addSession(validSession);

      sessionManager.removeSession(validSession);

      if (validSession.sessionNonce) {
        expect(
          sessionManager.getSession(validSession.sessionNonce)
        ).toBeUndefined();
      }
      if (validSession.peerIdentityKey) {
        expect(
          sessionManager.getSession(validSession.peerIdentityKey)
        ).toBeUndefined();
      }
    });

    it("should not throw an error when removing a session with undefined identifiers", () => {
      const sessionWithUndefinedIdentifiers = {
        ...validSession,
        sessionNonce: undefined,
        peerIdentityKey: undefined,
      };

      expect(() =>
        sessionManager.removeSession(sessionWithUndefinedIdentifiers)
      ).not.toThrow();
    });
  });

  describe("hasSession", () => {
    it("should return true if a session exists for the identifier", () => {
      sessionManager.addSession(validSession);

      if (validSession.sessionNonce) {
        expect(sessionManager.hasSession(validSession.sessionNonce)).toBe(true);
      }
      if (validSession.peerIdentityKey) {
        expect(sessionManager.hasSession(validSession.peerIdentityKey)).toBe(
          true
        );
      }
    });

    it("should return false if no session exists for the identifier", () => {
      expect(sessionManager.hasSession("nonExistentIdentifier")).toBe(false);
    });
  });
});
