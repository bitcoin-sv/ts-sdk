/**
 * These vectors check our implementation of AES-GCM encryption.
 *
 * The first 32 bytes of the ciphertext contain the initialization vector and
 * the rest is the AES-GCM ciphertext.
 *
 * The plaintext is whatever we want to encrypt represented as a string.
 *
 * Because the initialization vector is generated randomly during the
 * encryption process, we cannot use determanistic test vectors to test the
 * encrypt functionality. Therefore, only the test runner for the decrypt
 * function will execute and validate against the vectors.
 */
export default [
  {
    ciphertext: '1cf74FpvW0koFZk5e1VQcCtF7UdLj9mtN/L9loFlXwhf6w/06THwVirsvDShuT/KlOjO/HFALj8AcGLU1KRs4zNJDaX2wNebuPkH+qp5N/0cp3fZxgFzHJB3jBPDcdFi8O9WXIBLx9jUQ5KFQk0mZCB2k90VniInWuzqqOQAQQlBy2rgBWp4xg==',
    key: 'LIe9CoVXxDDDKt9F4j2lE+GP4oPcMElwyX+LVsuRLqw=',
    plaintext: '5+w9tts+i14GDfPSEJwcaAfce7zVLC7wsRAMnCBqIczkqL08I05FZTl7n14H9hnPkS7HBm3EGWNDKCZ64ckCGg=='
  },
  {
    ciphertext: 'IFh45HxwvK7wgIZr5UDxvUiEkvjsXVV6VIksaEQoTNCPleaRxE1CE1eZj5ZSPa/Mo2HXa2kvEmVAMslY12gMb7qHAHT2fSORB8TJKubKcjwGUrRxqOWvk24lv7QKhq3uhKkJxZSkPBZS6UM+xX+x7Mb53CoC8Z+7Ork50wGRAA415C+T8FIluA==',
    key: 'Di30+CTH8yKVJfXmbkRU6DOesD042IkjZCbFL1lnNqY=',
    plaintext: '6pHqDrkIuGmWIpB1spu30PP848D04WlERSjrEZ/JD0jfdS814cOjs4MFkePT1IHeM4+qGFwAMk7HKgWShOKFDQ=='
  },
  {
    ciphertext: 'JeUMCTX3hW7uH7Njfqjtjxd/8jB0Uj4eLLbLNBSMqF3XJmtq2oyX/WWS1po8cwn7jrcK0k8mVxHax/DctH6CIDMc0udBxWYLDyftvIYr448otWmn2IKQN4d3Bh2PKdiIQOo36DO2wOy+T2OJSmJ2XvAkenSZIckCdPIQVpeIi7Bt2ZpHmkObkg==',
    key: 'v7kFn4JdB3OVVjy8lk7UTvWe0vY5Qyzn64Q0EVoezlU=',
    plaintext: 'bSYHdJn15pcsaI8CNmfjKQ3ZvMg7zBaxuxBqyWBmCLdqj29bK54C26G1mx5e605hDrFpuJoNSDTECrk67ebffA=='
  },
  {
    ciphertext: 'ktpzKolKsvtWrvLl0yMdGvh5ngd1hiaNcC1b5yuzo2DEKO/4S7gePO/CWOmW/dloHhzfbBQH9rKDFKK7xHHgqYRc',
    key: 'qIgnjD0FfGVMiWo107bP0oHsLA402lhC7AYUFIKY1KQ=',
    plaintext: 'A cat and a mouse.'
  },
  {
    ciphertext: 'vremTalPp+NxN/loEtLMB94tEymdFk2TfBoTWNYcf4sQqYSNkx2WPdJ4LxrIsGuIg9KMOt7FOcIpDb6rRVpP',
    key: 'K7E/bf3wp6hrVeW0V1KvFJS5JZMhyxwPHCIW6wKBTb0=',
    plaintext: 'üñîçø∂é'
  }
]
