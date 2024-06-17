import { hexToUint8Array } from './converters';
import { TOTP, TOTPOptions } from './totp';

const hexKey = hexToUint8Array('48656c6c6f21deadbeef');
const period = 30; //sec
const periodMS = 30 * 1000; //ms
const options: TOTPOptions = {
  digits: 6,
  period,
  algorithm: 'SHA-1',
};

describe('totp generation and validation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.resetAllMocks());

  test.each([
    { time: 0, expected: '282760', description: 'should generate token at Unix epoch start' },
    { time: 1465324707000, expected: '341128', description: 'should generate token for a specific timestamp in 2016' },
    {
      time: 1665644340000 + 1,
      expected: '886842',
      description: 'should generate correct token at the start of the cycle',
    },
    {
      time: 1665644340000 - 1,
      expected: '134996',
      description: 'should generate correct token at the end of the cycle',
    },
    { time: 1365324707000, expected: '089029', description: 'should generate token with a leading zero' },
  ])('$description', async ({ time, expected }) => {
    jest.setSystemTime(time);

    //check if expected passcode is generated
    const passcode = TOTP.generate(hexKey, options);
    expect(passcode).toEqual(expected);

    expect(TOTP.validate(hexKey, '000000', options)).toEqual(false); //this passcode should not be valid for any of above test cases

    //should not be valid for only a part of passcode
    expect(TOTP.validate(hexKey, passcode.slice(1), options)).toEqual(false);

    expect(TOTP.validate(hexKey, passcode, options)).toEqual(true);

    const checkAdjacentWindow = (timeOfGeneration: number, expected: boolean) => {
      jest.setSystemTime(timeOfGeneration);
      const adjacentTimewindowPasscode = TOTP.generate(hexKey, options);

      jest.setSystemTime(time);
      expect(TOTP.validate(hexKey, adjacentTimewindowPasscode, options)).toEqual(expected);
    };

    //because the 'skew' is '1' by default, the passcode for the next window also should be valid
    checkAdjacentWindow(time + periodMS, true);
    checkAdjacentWindow(time - periodMS, true);

    //for 'skew': 1, other passcodes for further timewindows should not be valid
    for (let i = 2; i < 10; i++) {
      checkAdjacentWindow(time + i * periodMS, false);
      checkAdjacentWindow(time - i * periodMS, false);
    }
  });
});
