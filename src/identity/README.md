# IdentityClient

**Resolve who others are and let the world know who you are.**

## Overview

`IdentityClient` provides a straightforward interface for resolving and revealing identity certificates. It allows applications to verify user identities through certificates issued by trusted certifiers, reveal identity attributes publicly on the blockchain, and resolving identities associated with given attributes or identity keys.

## Features

- **Selective Attribute Revelation**: Create identity tokens which publicly reveal selective identity attributes and are tracked by overlay services.
- **Identity Resolution**: Easily resolve identity certificates based on identity keys or specific attributes.
- **Displayable Identities**: Parse identity certificates into user-friendly, displayable identities.

## Installation

```bash
npm install @bsv/sdk
```

## Usage

### Initialization

```typescript
import { IdentityClient } from '@bsv/sdk'

const identityClient = new IdentityClient()
```

### Publicly Reveal Attributes

```typescript
const broadcastResult = await identityClient.publiclyRevealAttributes(certificate, ['name', 'email'])
```

### Resolve Identity by Key

```typescript
const identities = await identityClient.resolveByIdentityKey({
  identityKey: '<identity-key-here>'
})
```

### Resolve Identity by Attributes

```typescript
const identities = await identityClient.resolveByAttributes({
  attributes: { email: 'user@example.com' }
})
```

## React Example

```ts
import React, { useEffect, useState } from 'react'
import { IdentityClient } from '@bsv/sdk'

const identityClient = new IdentityClient()

function IdentityDisplay({ identityKey }) {
  const [identities, setIdentities] = useState([])

  useEffect(() => {
    async function fetchIdentities() {
      const results = await identityClient.resolveByIdentityKey({ identityKey })
      setIdentities(results)
    }

    fetchIdentities()
  }, [identityKey])

  return (
    <div>
      {identities.map((identity, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          <img src={identity.avatarURL} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '25px' }} />
          <h3>{identity.name}</h3>
          <p>{identity.badgeLabel}</p>
          <a href={identity.badgeClickURL}>Learn More</a>
        </div>
      ))}
    </div>
  )
}

export default IdentityDisplay
```

## License

Open BSV License

