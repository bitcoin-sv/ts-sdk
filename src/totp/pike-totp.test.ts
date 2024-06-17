import { Contact } from '../types';
import { generateTotpForContact, validateTotpForContact } from './pike-totp';
import { HD } from '@bsv/sdk';

export const makeMockPKI = (xpub: string): string => {
  const contactBaseHD = new HD().fromString(xpub);
  const hd = contactBaseHD.derive('m/0/0/0');
  const pubKey = hd.pubKey;
  return pubKey.encode(true, 'hex') as string;
};

const aliceXPriv =
  'xprv9s21ZrQH143K4JFXqGhBzdrthyNFNuHPaMUwvuo8xvpHwWXprNK7T4JPj1w53S1gojQncyj8JhSh8qouYPZpbocsq934cH5G1t1DRBfgbod';
const aliceXPrivHD = new HD().fromString(aliceXPriv);
const bobXPub =
  'xpub661MyMwAqRbcFf7dwiYF2cvyqrrfA9H4oMAuShiYJAJRUrc1vRKyXdpgsLQ55cxnsemYbJNaFBtYAyijPeosA46Sy9xwA9jQC4DGkEUW6XR';

const mockBobContact: Contact = {
  created_at: new Date(),
  fullName: '',
  id: '',
  status: '',
  paymail: 'test@paymail.com',
  pubKey: makeMockPKI(bobXPub),
};

describe('GenerateTotpForContact', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.resetAllMocks());

  it('should generate a TOTP proper number of digits', () => {
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, 60, 2).length).toBe(2);
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, 60, 4).length).toBe(4);
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, 60, 6).length).toBe(6);
  });

  test.each([
    { time: 1718357083000, expected: '1693' },
    { time: 1718357298000, expected: '3634' },
  ])('should equal to $expected at $time', async ({ time, expected }) => {
    const period = 60;
    const periodMS = 60 * 1000;
    jest.setSystemTime(time);
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, period, 4)).toEqual(expected);

    jest.setSystemTime(time + periodMS);
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, period, 4)).not.toEqual(expected);

    jest.setSystemTime(time - periodMS);
    expect(generateTotpForContact(aliceXPrivHD, mockBobContact, period, 4)).not.toEqual(expected);
  });
});

describe('ValidateTotpForContact', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.resetAllMocks());

  it('should validate a passcode for the given contact', () => {
    const passcode = generateTotpForContact(aliceXPrivHD, mockBobContact);
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, passcode, mockBobContact.paymail);
    expect(result).toBe(true);
  });

  it('should validate a passcode with custom period and digits', () => {
    const passcode = generateTotpForContact(aliceXPrivHD, mockBobContact, 1200, 4);
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, passcode, mockBobContact.paymail, 1200, 4);
    expect(result).toBe(true);
  });

  it('should return false for an invalid passcode', () => {
    jest.setSystemTime(1718357083000);
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, '0000', mockBobContact.paymail, 60, 2);
    expect(result).toBe(false);
  });

  it('should return false for too short passcode', () => {
    jest.setSystemTime(1718357083000);
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, '169', mockBobContact.paymail, 60, 4);
    expect(result).toBe(false);
  });

  it('should return false for too long passcode', () => {
    jest.setSystemTime(1718357083000);
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, '16933', mockBobContact.paymail, 60, 4);
    expect(result).toBe(false);
  });

  it('should return false for an invalid TOTP', () => {
    const result = validateTotpForContact(aliceXPrivHD, mockBobContact, 'avg', mockBobContact.paymail);
    expect(result).toBe(false);
  });
});
