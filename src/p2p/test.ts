import { WalletClient } from '@bsv/sdk';

(async () => {
  try {
    const client = new WalletClient('json-api', 'localhost');
    const identityKey = await client.getPublicKey({ identityKey: true });
    console.log('[DEBUG] Retrieved Identity Key:', identityKey);
  } catch (error) {
    console.error('[ERROR] Failed to retrieve public key:', error);
  }
})();
