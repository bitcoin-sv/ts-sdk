export default [
  ['Format is: [scriptSig, scriptPubKey, comment]'],
  [
    '',
    'DEPTH 0 EQUAL',
    'Test the test: we should have an empty stack after scriptSig evaluation'
  ],
  [
    '  ',
    'DEPTH 0 EQUAL',
    'and multiple spaces should not change that.'
  ],
  [
    '   ',
    'DEPTH 0 EQUAL',
    'test'
  ],
  [
    '    ',
    'DEPTH 0 EQUAL',
    'test'
  ],
  [
    '1 2',
    '2 EQUALVERIFY 1 EQUAL',
    'Similarly whitespace around and between symbols'
  ],
  [
    '1  2',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '  1  2',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '1  2  ',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '  1  2  ',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '0',
    'IF 0x50 ENDIF 1',
    '0x50 is reserved (ok if not executed)'
  ],
  [
    '0x51',
    '0x5f ADD 0x60 EQUAL',
    '0x51 through 0x60 push 1 through 16 onto stack'
  ],
  [
    '1',
    'NOP',
    'test'
  ],
  [
    '0',
    'IF VER ELSE 1 ENDIF',
    'VER non-functional (ok if not executed)'
  ],
  [
    '0',
    'IF RESERVED RESERVED1 RESERVED2 ELSE 1 ENDIF',
    'RESERVED ok in un-executed IF'
  ],
  [
    '1',
    'DUP IF ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ENDIF',
    'test'
  ],
  [
    '1',
    'DUP IF ELSE ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ELSE ENDIF',
    'test'
  ],
  [
    '0',
    'IF ELSE 1 ENDIF',
    'test'
  ],
  [
    '1 1',
    'IF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'IF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 1',
    'IF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0 0',
    'IF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'NOTIF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 1',
    'NOTIF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'NOTIF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0 1',
    'NOTIF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0 ELSE 1 ELSE 0 ENDIF',
    "Multiple ELSE's are valid and executed inverts on each ELSE encountered"
  ],
  [
    '1',
    'IF 1 ELSE 0 ELSE ENDIF',
    'test'
  ],
  [
    '1',
    'IF ELSE 0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ELSE 0 ELSE 1 ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '1',
    'NOTIF 0 ELSE 1 ELSE 0 ENDIF',
    "Multiple ELSE's are valid and execution inverts on each ELSE encountered"
  ],
  [
    '0',
    'NOTIF 1 ELSE 0 ELSE ENDIF',
    'test'
  ],
  [
    '0',
    'NOTIF ELSE 0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'NOTIF 1 ELSE 0 ELSE 1 ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '0',
    'IF 1 IF RETURN ELSE RETURN ELSE RETURN ENDIF ELSE 1 IF 1 ELSE RETURN ELSE 1 ENDIF ELSE RETURN ENDIF ADD 2 EQUAL',
    'Nested ELSE ELSE'
  ],
  [
    '1',
    'NOTIF 0 NOTIF RETURN ELSE RETURN ELSE RETURN ENDIF ELSE 0 NOTIF 1 ELSE RETURN ELSE 1 ENDIF ELSE RETURN ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '0',
    'IF RETURN ENDIF 1',
    'RETURN only works if executed'
  ],
  [
    '1 1',
    'VERIFY',
    'test'
  ],
  [
    '1 0x05 0x01 0x00 0x00 0x00 0x00',
    'VERIFY',
    'values >4 bytes can be cast to boolean'
  ],
  [
    '1 0x01 0x80',
    'IF 0 ENDIF',
    'negative 0 is false'
  ],
  [
    '0',
    'DUP 1 ADD 1 EQUALVERIFY 0 EQUAL',
    'test'
  ],
  [
    '0 1',
    'NIP',
    'test'
  ],
  [
    '22 21 20',
    'ROT DROP DROP 21 EQUAL',
    'test'
  ],
  [
    '25 24 23 22 21 20',
    '2ROT 2DROP 2DROP DROP 23 EQUAL',
    'test'
  ],
  [
    '1 0',
    'SWAP 1 EQUALVERIFY 0 EQUAL',
    'test'
  ],
  [
    '0 1',
    'TUCK DEPTH 3 EQUALVERIFY SWAP 2DROP',
    'test'
  ],
  [
    '13 14',
    '2DUP ROT EQUALVERIFY EQUAL',
    'test'
  ],
  [
    '-1 0 1 2',
    '3DUP DEPTH 7 EQUALVERIFY ADD ADD 3 EQUALVERIFY 2DROP 0 EQUALVERIFY',
    'test'
  ],
  [
    '1 2 3 5',
    '2OVER ADD ADD 8 EQUALVERIFY ADD ADD 6 EQUAL',
    'test'
  ],
  [
    '1 3 5 7',
    '2SWAP ADD 4 EQUALVERIFY ADD 12 EQUAL',
    'test'
  ],
  [
    '42',
    'SIZE 1 EQUALVERIFY 42 EQUAL',
    'SIZE does not consume argument'
  ],
  [
    '0 0',
    'EQUAL',
    'test'
  ],
  [
    '11 10',
    'LESSTHAN NOT',
    'test'
  ],
  [
    '4 4',
    'LESSTHAN NOT',
    'test'
  ],
  [
    '10 11',
    'LESSTHAN',
    'test'
  ],
  [
    '-11 11',
    'LESSTHAN',
    'test'
  ],
  [
    '-11 -10',
    'LESSTHAN',
    'test'
  ],
  [
    '11 10',
    'GREATERTHAN',
    'test'
  ],
  [
    '4 4',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '10 11',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '-11 11',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '-11 -10',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '11 10',
    'LESSTHANOREQUAL NOT',
    'test'
  ],
  [
    '4 4',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '10 11',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '-11 11',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '-11 -10',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '11 10',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '4 4',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '10 11',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '-11 11',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '-11 -10',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '0 0 1',
    'WITHIN',
    'test'
  ],
  [
    '1 0 1',
    'WITHIN NOT',
    'test'
  ],
  [
    '0 -2147483647 2147483647',
    'WITHIN',
    'test'
  ],
  [
    '-1 -100 100',
    'WITHIN',
    'test'
  ],
  [
    '11 -100 100',
    'WITHIN',
    'test'
  ],
  [
    '-2147483647 -100 100',
    'WITHIN NOT',
    'test'
  ],
  [
    '2147483647 -100 100',
    'WITHIN NOT',
    'test'
  ],
  [
    '1',
    'NOP1 NOP2 NOP3 NOP4 NOP5 NOP6 NOP7 NOP8 NOP9 NOP10 1 EQUAL',
    'test'
  ],
  [
    '1',
    'NOP',
    'Discourage NOPx flag allows OP_NOP'
  ],
  [
    '0',
    'IF NOP10 ENDIF 1',
    'Discouraged NOPs are allowed if not executed'
  ],
  [
    '0',
    'IF 0xba ELSE 1 ENDIF',
    'opcodes above NOP10 invalid if executed'
  ],
  [
    '0',
    'IF 0xbb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbe ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xca ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xce ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xda ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xde ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xea ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xeb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xec ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xed ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xee ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xef ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfa ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfe ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xff ELSE 1 ENDIF',
    'test'
  ],
  [
    '1',
    '0x616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161',
    '201 opcodes executed. 0x61 is NOP'
  ],
  [
    '0',
    'IF 0x5050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050 ENDIF 1',
    ">201 opcodes, but RESERVED (0x50) doesn't count towards opcode limit."
  ],
  [
    '127',
    '0x01 0x7F EQUAL',
    'test'
  ],
  [
    '128',
    '0x02 0x8000 EQUAL',
    'Leave room for the sign bit'
  ],
  [
    '32767',
    '0x02 0xFF7F EQUAL',
    'test'
  ],
  [
    '32768',
    '0x03 0x008000 EQUAL',
    'test'
  ],
  [
    '8388607',
    '0x03 0xFFFF7F EQUAL',
    'test'
  ],
  [
    '8388608',
    '0x04 0x00008000 EQUAL',
    'test'
  ],
  [
    '2147483647',
    '0x04 0xFFFFFF7F EQUAL',
    'test'
  ],
  [
    '2147483648',
    '0x05 0x0000008000 EQUAL',
    'test'
  ],
  [
    '549755813887',
    '0x05 0xFFFFFFFF7F EQUAL',
    'test'
  ],
  [
    '9223372036854775807',
    '0x08 0xFFFFFFFFFFFFFF7F EQUAL',
    'test'
  ],
  [
    '-127',
    '0x01 0xFF EQUAL',
    'test'
  ],
  [
    '-128',
    '0x02 0x8080 EQUAL',
    'test'
  ],
  [
    '-32767',
    '0x02 0xFFFF EQUAL',
    'test'
  ],
  [
    '-32768',
    '0x03 0x008080 EQUAL',
    'test'
  ],
  [
    '-8388607',
    '0x03 0xFFFFFF EQUAL',
    'test'
  ],
  [
    '-8388608',
    '0x04 0x00008080 EQUAL',
    'test'
  ],
  [
    '-2147483647',
    '0x04 0xFFFFFFFF EQUAL',
    'test'
  ],
  [
    '-2147483648',
    '0x05 0x0000008080 EQUAL',
    'test'
  ],
  [
    '-4294967295',
    '0x05 0xFFFFFFFF80 EQUAL',
    'test'
  ],
  [
    '-549755813887',
    '0x05 0xFFFFFFFFFF EQUAL',
    'test'
  ],
  [
    '-549755813888',
    '0x06 0x000000008080 EQUAL',
    'test'
  ],
  [
    '-9223372036854775807',
    '0x08 0xFFFFFFFFFFFFFFFF EQUAL',
    'test'
  ],
  [
    '2147483647',
    '1ADD 2147483648 EQUAL',
    'We can do math on 4-byte integers, and compare 5-byte ones'
  ],
  [
    '1',
    '0x02 0x0100 EQUAL NOT',
    'Not the same byte array...'
  ],
  [
    '0',
    '0x01 0x80 EQUAL NOT',
    'test'
  ],
  [
    '1',
    'IF 1 ENDIF',
    'They are here to catch copy-and-paste errors'
  ],
  [
    '0',
    'NOTIF 1 ENDIF',
    'Most of them are duplicated elsewhere,'
  ],
  [
    '1',
    'VERIFY 1',
    'but, hey, more is always better, right?'
  ],
  [
    '0',
    'TOALTSTACK 1',
    'test'
  ],
  [
    '1',
    'TOALTSTACK FROMALTSTACK',
    'test'
  ],
  [
    '0 0',
    '2DROP 1',
    'test'
  ],
  [
    '0',
    'DROP 1',
    'test'
  ],
  [
    '0 1',
    'NIP',
    'test'
  ],
  [
    '1 0',
    'ROLL',
    'test'
  ],
  [
    '0 0',
    'EQUAL',
    'test'
  ],
  [
    '0 0',
    'EQUALVERIFY 1',
    'test'
  ],
  [
    '0 0 1',
    'EQUAL EQUAL',
    'OP_0 and bools must have identical byte representations'
  ],
  [
    '0',
    '1ADD',
    'test'
  ],
  [
    '2',
    '1SUB',
    'test'
  ],
  [
    '-1',
    'NEGATE',
    'test'
  ],
  [
    '-1',
    'ABS',
    'test'
  ],
  [
    '0',
    'NOT',
    'test'
  ],
  [
    '-1',
    '0NOTEQUAL',
    'test'
  ],
  [
    '1 0',
    'ADD',
    'test'
  ],
  [
    '1 0',
    'SUB',
    'test'
  ],
  [
    '-1 -1',
    'BOOLAND',
    'test'
  ],
  [
    '-1 0',
    'BOOLOR',
    'test'
  ],
  [
    '0 0',
    'NUMEQUAL',
    'test'
  ],
  [
    '0 0',
    'NUMEQUALVERIFY 1',
    'test'
  ],
  [
    '-1 0',
    'NUMNOTEQUAL',
    'test'
  ],
  [
    '-1 0',
    'LESSTHAN',
    'test'
  ],
  [
    '1 0',
    'GREATERTHAN',
    'test'
  ],
  [
    '0 0',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '0 0',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '-1 0',
    'MIN',
    'test'
  ],
  [
    '1 0',
    'MAX',
    'test'
  ],
  [
    '-1 -1 0',
    'WITHIN',
    'test'
  ],
  [
    '0',
    'RIPEMD160',
    'test'
  ],
  [
    '0',
    'SHA1',
    'test'
  ],
  [
    '0',
    'SHA256',
    'test'
  ],
  [
    '0',
    'HASH160',
    'test'
  ],
  [
    '0',
    'HASH256',
    'test'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'CHECKMULTISIG is allowed to have zero keys and/or sigs'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'Zero sigs means no sigs are checked'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'CHECKMULTISIG is allowed to have zero keys and/or sigs'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'Zero sigs means no sigs are checked'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '1',
    '0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY',
    'test'
  ],
  [
    '0x02 0x8000',
    '128 NUMEQUAL',
    '0x8000 equals 128'
  ],
  [
    '0',
    '0x21 0x02865c40293a680cb9c020e7b1e106d8c1916d3cef99aa431a56d253e69256dac0 CHECKSIG NOT',
    'test'
  ],
  [
    '0 0',
    '1 0x21 0x02865c40293a680cb9c020e7b1e106d8c1916d3cef99aa431a56d253e69256dac0 1 CHECKMULTISIG NOT',
    'test'
  ],
  [
    '0',
    '0x21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 CHECKSIG NOT',
    'BIP66 example 4, without DERSIG'
  ],
  [
    '0',
    '0x21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 CHECKSIG NOT',
    'BIP66 example 4, with DERSIG'
  ],
  [
    '',
    'DEPTH 0 EQUAL',
    'Test the test: we should have an empty stack after scriptSig evaluation'
  ],
  [
    '  ',
    'DEPTH 0 EQUAL',
    'and multiple spaces should not change that.'
  ],
  [
    '   ',
    'DEPTH 0 EQUAL',
    'test'
  ],
  [
    '    ',
    'DEPTH 0 EQUAL',
    'test'
  ],
  [
    '1 2',
    '2 EQUALVERIFY 1 EQUAL',
    'Similarly whitespace around and between symbols'
  ],
  [
    '1  2',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '  1  2',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '1  2  ',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '  1  2  ',
    '2 EQUALVERIFY 1 EQUAL',
    'test'
  ],
  [
    '0',
    'IF 0x50 ENDIF 1',
    '0x50 is reserved (ok if not executed)'
  ],
  [
    '0x51',
    '0x5f ADD 0x60 EQUAL',
    '0x51 through 0x60 push 1 through 16 onto stack'
  ],
  [
    '1',
    'NOP',
    'test'
  ],
  [
    '0',
    'IF VER ELSE 1 ENDIF',
    'VER non-functional (ok if not executed)'
  ],
  [
    '0',
    'IF RESERVED RESERVED1 RESERVED2 ELSE 1 ENDIF',
    'RESERVED ok in un-executed IF'
  ],
  [
    '1',
    'DUP IF ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ENDIF',
    'test'
  ],
  [
    '1',
    'DUP IF ELSE ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ELSE ENDIF',
    'test'
  ],
  [
    '0',
    'IF ELSE 1 ENDIF',
    'test'
  ],
  [
    '1 1',
    'IF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'IF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 1',
    'IF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0 0',
    'IF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'NOTIF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 1',
    'NOTIF IF 1 ELSE 0 ENDIF ENDIF',
    'test'
  ],
  [
    '1 0',
    'NOTIF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0 1',
    'NOTIF IF 1 ELSE 0 ENDIF ELSE IF 0 ELSE 1 ENDIF ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0 ELSE 1 ELSE 0 ENDIF',
    "Multiple ELSE's are valid and executed inverts on each ELSE encountered"
  ],
  [
    '1',
    'IF 1 ELSE 0 ELSE ENDIF',
    'test'
  ],
  [
    '1',
    'IF ELSE 0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '1',
    'IF 1 ELSE 0 ELSE 1 ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '1',
    'NOTIF 0 ELSE 1 ELSE 0 ENDIF',
    "Multiple ELSE's are valid and execution inverts on each ELSE encountered"
  ],
  [
    '0',
    'NOTIF 1 ELSE 0 ELSE ENDIF',
    'test'
  ],
  [
    '0',
    'NOTIF ELSE 0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'NOTIF 1 ELSE 0 ELSE 1 ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '0',
    'IF 1 IF RETURN ELSE RETURN ELSE RETURN ENDIF ELSE 1 IF 1 ELSE RETURN ELSE 1 ENDIF ELSE RETURN ENDIF ADD 2 EQUAL',
    'Nested ELSE ELSE'
  ],
  [
    '1',
    'NOTIF 0 NOTIF RETURN ELSE RETURN ELSE RETURN ENDIF ELSE 0 NOTIF 1 ELSE RETURN ELSE 1 ENDIF ELSE RETURN ENDIF ADD 2 EQUAL',
    'test'
  ],
  [
    '0',
    'IF RETURN ENDIF 1',
    'RETURN only works if executed'
  ],
  [
    '1 1',
    'VERIFY',
    'test'
  ],
  [
    '1 0x05 0x01 0x00 0x00 0x00 0x00',
    'VERIFY',
    'values >4 bytes can be cast to boolean'
  ],
  [
    '1 0x01 0x80',
    'IF 0 ENDIF',
    'negative 0 is false'
  ],
  [
    '0',
    'DUP 1 ADD 1 EQUALVERIFY 0 EQUAL',
    'test'
  ],
  [
    '0 1',
    'NIP',
    'test'
  ],
  [
    '22 21 20',
    'ROT DROP DROP 21 EQUAL',
    'test'
  ],
  [
    '25 24 23 22 21 20',
    '2ROT 2DROP 2DROP DROP 23 EQUAL',
    'test'
  ],
  [
    '1 0',
    'SWAP 1 EQUALVERIFY 0 EQUAL',
    'test'
  ],
  [
    '0 1',
    'TUCK DEPTH 3 EQUALVERIFY SWAP 2DROP',
    'test'
  ],
  [
    '13 14',
    '2DUP ROT EQUALVERIFY EQUAL',
    'test'
  ],
  [
    '-1 0 1 2',
    '3DUP DEPTH 7 EQUALVERIFY ADD ADD 3 EQUALVERIFY 2DROP 0 EQUALVERIFY',
    'test'
  ],
  [
    '1 2 3 5',
    '2OVER ADD ADD 8 EQUALVERIFY ADD ADD 6 EQUAL',
    'test'
  ],
  [
    '1 3 5 7',
    '2SWAP ADD 4 EQUALVERIFY ADD 12 EQUAL',
    'test'
  ],
  [
    '42',
    'SIZE 1 EQUALVERIFY 42 EQUAL',
    'SIZE does not consume argument'
  ],
  [
    '0 0',
    'EQUAL',
    'test'
  ],
  [
    '11 10',
    'LESSTHAN NOT',
    'test'
  ],
  [
    '4 4',
    'LESSTHAN NOT',
    'test'
  ],
  [
    '10 11',
    'LESSTHAN',
    'test'
  ],
  [
    '-11 11',
    'LESSTHAN',
    'test'
  ],
  [
    '-11 -10',
    'LESSTHAN',
    'test'
  ],
  [
    '11 10',
    'GREATERTHAN',
    'test'
  ],
  [
    '4 4',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '10 11',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '-11 11',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '-11 -10',
    'GREATERTHAN NOT',
    'test'
  ],
  [
    '11 10',
    'LESSTHANOREQUAL NOT',
    'test'
  ],
  [
    '4 4',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '10 11',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '-11 11',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '-11 -10',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '11 10',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '4 4',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '10 11',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '-11 11',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '-11 -10',
    'GREATERTHANOREQUAL NOT',
    'test'
  ],
  [
    '0 0 1',
    'WITHIN',
    'test'
  ],
  [
    '1 0 1',
    'WITHIN NOT',
    'test'
  ],
  [
    '0 -2147483647 2147483647',
    'WITHIN',
    'test'
  ],
  [
    '-1 -100 100',
    'WITHIN',
    'test'
  ],
  [
    '11 -100 100',
    'WITHIN',
    'test'
  ],
  [
    '-2147483647 -100 100',
    'WITHIN NOT',
    'test'
  ],
  [
    '2147483647 -100 100',
    'WITHIN NOT',
    'test'
  ],
  [
    '1',
    'NOP1 NOP2 NOP3 NOP4 NOP5 NOP6 NOP7 NOP8 NOP9 NOP10 1 EQUAL',
    'test'
  ],
  [
    '1',
    'NOP',
    'Discourage NOPx flag allows OP_NOP'
  ],
  [
    '0',
    'IF NOP10 ENDIF 1',
    'Discouraged NOPs are allowed if not executed'
  ],
  [
    '0',
    'IF 0xba ELSE 1 ENDIF',
    'opcodes above NOP10 invalid if executed'
  ],
  [
    '0',
    'IF 0xbb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbe ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xbf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xc9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xca ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xce ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xcf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xd9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xda ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xde ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xdf ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xe9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xea ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xeb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xec ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xed ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xee ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xef ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf0 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf1 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf2 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf3 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf4 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf5 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf6 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf7 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf8 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xf9 ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfa ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfb ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfc ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfd ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xfe ELSE 1 ENDIF',
    'test'
  ],
  [
    '0',
    'IF 0xff ELSE 1 ENDIF',
    'test'
  ],
  [
    '1',
    '0x616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161',
    '201 opcodes executed. 0x61 is NOP'
  ],
  [
    '0',
    'IF 0x5050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050505050 ENDIF 1',
    ">201 opcodes, but RESERVED (0x50) doesn't count towards opcode limit."
  ],
  [
    '127',
    '0x01 0x7F EQUAL',
    'test'
  ],
  [
    '128',
    '0x02 0x8000 EQUAL',
    'Leave room for the sign bit'
  ],
  [
    '32767',
    '0x02 0xFF7F EQUAL',
    'test'
  ],
  [
    '32768',
    '0x03 0x008000 EQUAL',
    'test'
  ],
  [
    '8388607',
    '0x03 0xFFFF7F EQUAL',
    'test'
  ],
  [
    '8388608',
    '0x04 0x00008000 EQUAL',
    'test'
  ],
  [
    '2147483647',
    '0x04 0xFFFFFF7F EQUAL',
    'test'
  ],
  [
    '2147483648',
    '0x05 0x0000008000 EQUAL',
    'test'
  ],
  [
    '549755813887',
    '0x05 0xFFFFFFFF7F EQUAL',
    'test'
  ],
  [
    '9223372036854775807',
    '0x08 0xFFFFFFFFFFFFFF7F EQUAL',
    'test'
  ],
  [
    '-127',
    '0x01 0xFF EQUAL',
    'test'
  ],
  [
    '-128',
    '0x02 0x8080 EQUAL',
    'test'
  ],
  [
    '-32767',
    '0x02 0xFFFF EQUAL',
    'test'
  ],
  [
    '-32768',
    '0x03 0x008080 EQUAL',
    'test'
  ],
  [
    '-8388607',
    '0x03 0xFFFFFF EQUAL',
    'test'
  ],
  [
    '-8388608',
    '0x04 0x00008080 EQUAL',
    'test'
  ],
  [
    '-2147483647',
    '0x04 0xFFFFFFFF EQUAL',
    'test'
  ],
  [
    '-2147483648',
    '0x05 0x0000008080 EQUAL',
    'test'
  ],
  [
    '-4294967295',
    '0x05 0xFFFFFFFF80 EQUAL',
    'test'
  ],
  [
    '-549755813887',
    '0x05 0xFFFFFFFFFF EQUAL',
    'test'
  ],
  [
    '-549755813888',
    '0x06 0x000000008080 EQUAL',
    'test'
  ],
  [
    '-9223372036854775807',
    '0x08 0xFFFFFFFFFFFFFFFF EQUAL',
    'test'
  ],
  [
    '2147483647',
    '1ADD 2147483648 EQUAL',
    'We can do math on 4-byte integers, and compare 5-byte ones'
  ],
  [
    '1',
    '0x02 0x0100 EQUAL NOT',
    'Not the same byte array...'
  ],
  [
    '0',
    '0x01 0x80 EQUAL NOT',
    'test'
  ],
  [
    '1',
    'IF 1 ENDIF',
    'They are here to catch copy-and-paste errors'
  ],
  [
    '0',
    'NOTIF 1 ENDIF',
    'Most of them are duplicated elsewhere,'
  ],
  [
    '1',
    'VERIFY 1',
    'but, hey, more is always better, right?'
  ],
  [
    '0',
    'TOALTSTACK 1',
    'test'
  ],
  [
    '1',
    'TOALTSTACK FROMALTSTACK',
    'test'
  ],
  [
    '0 0',
    '2DROP 1',
    'test'
  ],
  [
    '0',
    'DROP 1',
    'test'
  ],
  [
    '0 1',
    'NIP',
    'test'
  ],
  [
    '1 0',
    'ROLL',
    'test'
  ],
  [
    '0 0',
    'EQUAL',
    'test'
  ],
  [
    '0 0',
    'EQUALVERIFY 1',
    'test'
  ],
  [
    '0 0 1',
    'EQUAL EQUAL',
    'OP_0 and bools must have identical byte representations'
  ],
  [
    '0',
    '1ADD',
    'test'
  ],
  [
    '2',
    '1SUB',
    'test'
  ],
  [
    '-1',
    'NEGATE',
    'test'
  ],
  [
    '-1',
    'ABS',
    'test'
  ],
  [
    '0',
    'NOT',
    'test'
  ],
  [
    '-1',
    '0NOTEQUAL',
    'test'
  ],
  [
    '1 0',
    'ADD',
    'test'
  ],
  [
    '1 0',
    'SUB',
    'test'
  ],
  [
    '-1 -1',
    'BOOLAND',
    'test'
  ],
  [
    '-1 0',
    'BOOLOR',
    'test'
  ],
  [
    '0 0',
    'NUMEQUAL',
    'test'
  ],
  [
    '0 0',
    'NUMEQUALVERIFY 1',
    'test'
  ],
  [
    '-1 0',
    'NUMNOTEQUAL',
    'test'
  ],
  [
    '-1 0',
    'LESSTHAN',
    'test'
  ],
  [
    '1 0',
    'GREATERTHAN',
    'test'
  ],
  [
    '0 0',
    'LESSTHANOREQUAL',
    'test'
  ],
  [
    '0 0',
    'GREATERTHANOREQUAL',
    'test'
  ],
  [
    '-1 0',
    'MIN',
    'test'
  ],
  [
    '1 0',
    'MAX',
    'test'
  ],
  [
    '-1 -1 0',
    'WITHIN',
    'test'
  ],
  [
    '0',
    'RIPEMD160',
    'test'
  ],
  [
    '0',
    'SHA1',
    'test'
  ],
  [
    '0',
    'SHA256',
    'test'
  ],
  [
    '0',
    'HASH160',
    'test'
  ],
  [
    '0',
    'HASH256',
    'test'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'CHECKMULTISIG is allowed to have zero keys and/or sigs'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'Zero sigs means no sigs are checked'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'CHECKMULTISIG is allowed to have zero keys and/or sigs'
  ],
  [
    '',
    '0 0 0 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIG VERIFY DEPTH 0 EQUAL',
    'Zero sigs means no sigs are checked'
  ],
  [
    '',
    '0 0 0 1 CHECKMULTISIGVERIFY DEPTH 0 EQUAL',
    'test'
  ],
  [
    '1',
    '0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY 0 0 0 CHECKMULTISIGVERIFY',
    'test'
  ]
]
