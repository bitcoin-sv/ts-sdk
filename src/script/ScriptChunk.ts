import OP from './OP.js'

export default interface ScriptChunk {
  op: OP,
  data?: number[]
}
