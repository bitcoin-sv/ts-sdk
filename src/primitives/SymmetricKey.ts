import BigNumber from './BigNumber'

export default class SymmetricKey extends BigNumber {
  encrypt (msg: number[] | string, enc?: 'hex'): string | number[] {
    return 'todo'
  }

  decrypt (msg: number[] | string, enc?: 'hex'): string | number[] {
    return 'todo'
  }
}
