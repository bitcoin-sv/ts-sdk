export default interface ChainTracker {
  isValidRootForHeight: (root: string, height: number) => boolean
}
