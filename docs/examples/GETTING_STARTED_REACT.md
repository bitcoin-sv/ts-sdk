Getting Started with BSV SDK using React and TypeScript
=======================================================

Welcome to the guide! This guide is designed for developers working in a React environment using TypeScript. We'll walk through the installation process and show you how to create and broadcast a Bitcoin SV transaction using the BSV SDK. Whether you're freshly starting on BSV or transitioning an existing project to use the SDK, this would be your go-to guide.

Prerequisites
-------------

Ensure that you have Node.js installed on your system. You can download and install Node.js from [nodejs.org](https://nodejs.org/). Basic knowledge of JavaScript, React and TypeScript is recommended for this guide.

Setting Up
----------

Begin by creating a new project using Create React App with the TypeScript template:

```bash
npx create-react-app my-bsv-app --template typescript
cd my-bsv-app
```

Next, install the BSV SDK package in your project:

```bash
npm install @bsv/sdk
```

Writing the Component
---------------------

Let's now create a Button component that builds and broadcasts a transaction when clicked.

1.  Create a new file in your project, such as `src/components/BsvButton.tsx`.
2.  At the top of your component file, import the necessary modules from the BSV SDK:

```
import React from 'react';
import { PrivateKey, Transaction, ARC, P2PKH } from '@bsv/sdk';
```

3.  Define a new component function, `BsvButton`, that handles the creation and broadcast of a transaction upon a button click:

```typescript
const BsvButton: React.FC = () => {
  const handleClick = async () => {
    const privKey = PrivateKey.fromWif('...')
    const sourceTransaction = Transaction.fromHex('...') // your source transaction goes here

    const version = 1
    const input = {
      sourceTransaction,
      sourceOutputIndex: 0,
      unlockingScriptTemplate: new P2PKH().unlock(privKey),
    }
    const output = {
      lockingScript: new P2PKH().lock(privKey.toPublicKey().toHash()),
      change: true
    }

    const tx = new Transaction(version, [input], [output])
    await tx.fee()
    await tx.sign()

    await tx.broadcast()
  }

  return (
    <button onClick={handleClick}>
      Create Transaction
    </button>
  );
}
```

4.  Finally, export the `BsvButton` component:

```typescript
export default BsvButton;
```

Integrating into Application
----------------------------

Now, let's integrate our `BsvButton` component into our app:

1.  Open `src/App.tsx`.
2.  Delete all of its content and replace it with the following:

```typescript
import React from 'react';
import BsvButton from './components/BsvButton';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BsvButton />
      </header>
    </div>
  );
}

export default App;
```

Running the App
---------------

To run your application, just type the following command in your terminal:

```bash
npm run start
```

Now when you click the button, a transaction will be created, signed, and broadcast to the BSV network.

Conclusion
----------

Congratulations! You've successfully integrated the BSV SDK into your TypeScript & React application and created a button which broadcasts a bitcoin transaction on click. This guide covered the basic steps needed to get you started, but the BSV SDK can do a lot more. Explore the SDK documentation to dive deep into all the features and functionalities available to build scalable applications on the BSV blockchain.
