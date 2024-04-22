# What are Hashes and Why are they Important in Bitcoin?

#### What is a Hash?

In the context of computer science, a hash is a function that converts an input (or 'message') into a fixed-size string of bytes. The output, typically a 'digest', represents concisely the original input data. A hash function is a type of one-way function, meaning it's easy to compute a hash from a given input but nearly impossible to recreate the original input just by knowing the hash value. This property ensures data integrity, as any alteration of the input data will result in a dramatically different hash.

#### Chain of Headers Using Hashes

In Bitcoin, every block in the blockchain is linked to its predecessor through a series of hash pointers in what is known as the 'chain of headers'. Each block header contains its own hash along with the hash of the previous block's header. This structure forms a secure, verifiable chain where each subsequent block reinforces the security of the previous block. Altering any single block would require recomputation of every hash that follows, a task computationally impractical, thus ensuring the integrity of the blockchain.

#### Merkle Trees: Verifying Transaction Inclusion

One of the core components of Bitcoin’s architecture is the use of Merkle trees as referenced in the Bitcoin whitepaper under sections 7 & 8. This efficient data structure allows us to quickly verify the inclusion of transactions in a block. Each transaction within a block has its hash, and these hashes are paired, hashed, paired again, and re-hashed until a single hash remains: the Merkle Root, which is stored in the block header. This process allows for a quick and secure verification of whether a specific transaction is included in the block without needing to download every transaction.

#### Practical Applications: On-Chain Use Cases and Tamper Evidence

The real-world application of hashing within applications built upon the Bitcoin SV blockchain is vast, particularly when proving the integrity and authenticity of data. For instance, in legal, financial, or real estate transactions, proving the non-tampered nature of a document or a series of transactions can be critical. Here, Bitcoin's blockchain serves as a tamper-evident ledger. Once data has been recorded in a block and absorbed into the blockchain through the chaining of hashes and the Merkle Root, it becomes immutable. This immutability is a powerful tool for proving that a document or transaction has not been altered post its original timestamping on the blockchain. 

If there needs to be an added level of privacy, while also insuring that there is an immutable record, the data itself can also be hashed prior to being recorded on chain. This allows anyone to check that the hash of the data matches without having to reveal what that data is to the world.