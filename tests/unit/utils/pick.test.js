const pick = require('../../../src/utils/pick');

describe('Util: pick', () => {
  let testObj;

  beforeEach(() => {
    testObj = {
      key1: 'sample1',
      key2: 'sample2',
      key3: 'sample3',
    };
  });

  test('should correctly pick given keys', async () => {
    const keys = ['key2', 'key3'];
    const pickObj = pick(testObj, keys);
    await expect(Object.keys(pickObj)).toStrictEqual(keys);
  });

  test('should return empty object with non-existing keys', async () => {
    const keys = ['key4'];
    const pickObj = pick(testObj, keys);
    await expect(Object.keys(pickObj)).toStrictEqual([]);
  });
});
