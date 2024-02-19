const httpStatus = require('http-status');
const catchAsync = require('../../../src/utils/catchAsync');
const ApiError = require('../../../src/utils/ApiError');

describe('Util: catchAsync', () => {
  let mockNext;
  beforeEach(() => {
    mockNext = jest.fn((x) => 42 + x);
  });

  test('should resolve when fn runs normally', async () => {
    const fn = catchAsync(async (req, res, next) => {
      return 'hi';
    });

    await expect(fn('req', 'res', mockNext)).toBeUndefined();
    await expect(mockNext).not.toHaveBeenCalled();
  });

  test('should call next mock when fn throws error', async () => {
    const fn = catchAsync(async (req, res, next) => {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'error');
    });

    await expect(fn('req', 'res', mockNext)).toBeUndefined();
    await expect(mockNext).toHaveBeenCalled();
  });
});
