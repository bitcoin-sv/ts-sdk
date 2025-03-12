import { AuthFetch, LookupResolver, MasterCertificate, PrivateKey, ProtoWallet, Transaction, Utils, WalletClient } from '@bsv/sdk'
import { IdentityClient } from '../IdentityClient'

(async () => {
  const clientWallet = new WalletClient('json-api', 'localhost')
  const identityKey = await clientWallet.getPublicKey({ identityKey: true })
  console.log(identityKey)

  // const { certificates } = await clientWallet.listCertificates({
  //   certifiers: ['0220529dc803041a83f4357864a09c717daa24397cf2f3fc3a5745ae08d30924fd'],
  //   types: ['AGfk/WrT1eBDXpz3mcw386Zww2HmqcIn3uY6x4Af1eo=']
  // })

  // const { certificates } = await clientWallet.listCertificates({
  //   certifiers: [],
  //   types: []
  // })
  // console.log(certificates)

  // const client = new IdentityClient(clientWallet)
  // const result = await client.publiclyRevealAttributes(
  //   certificates[0],
  //   ['cool']
  // )
  // const result = await client.discoverByIdentityKey({
  //   identityKey: '0240c42181068275a4f996ee570ed7c7a97c30003b174461bca5bad882fc06143f'
  // })

  // const result = await client.resolveByAttributes({
  //   attributes: {
  //     cool: 'true'
  //   }
  // })

  // const clientWallet = new WalletClient('json-api', 'localhost')

  // console.log(certificates)
  // const storageCert = certificates[0]
  // const certToDecrypt = new MasterCertificate(
  //   storageCert.type,
  //   storageCert.serialNumber,
  //   storageCert.subject,
  //   storageCert.certifier,
  //   storageCert.revocationOutpoint,
  //   storageCert.fields,
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   storageCert.keyring!,
  //   storageCert.signature
  // )
  // await certToDecrypt.verify()

  // const result = await MasterCertificate.decryptFields(
  //   new ProtoWallet(PrivateKey.fromHex('8c6ddbdbfca542c3e938d4326c18d65823a82f4b2c4f7758f1966360ea6c13a9')),
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   storageCert.keyring!,
  //   storageCert.fields,
  //   storageCert.certifier
  // )
  // console.log(result)

  // const verifier = new PrivateKey('1').toPublicKey().toString()
  // console.log('v', verifier)
  // const { keyringForVerifier, certificate } = await client.proveCertificate({
  //   certificate: certificates[0],
  //   fieldsToReveal: ['cool'],
  //   verifier
  // })

  // console.log('kr', keyringForVerifier)
  // console.log(certificate)

  // const result = await client.relinquishCertificate({
  //   type: 'AGfk/WrT1eBDXpz3mcw386Zww2HmqcIn3uY6x4Af1eo=',
  //   serialNumber: certificates[0].serialNumber,
  //   certifier: '0220529dc803041a83f4357864a09c717daa24397cf2f3fc3a5745ae08d30924fd'
  // })
  // console.log(result)
})().catch(e => { console.error(e) })
