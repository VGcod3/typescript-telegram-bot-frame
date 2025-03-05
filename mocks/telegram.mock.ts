export const mockTelegramBot = {
  sendMessage: jest.fn(),
  sendSticker: jest.fn(),
  sendPhoto: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
  editMessageMedia: jest.fn(),
};

// Remove test suite error by adding a dummy test
describe("Telegram Mock", () => {
  it("should provide mock methods", () => {
    expect(mockTelegramBot.sendMessage).toBeDefined();
    expect(mockTelegramBot.sendSticker).toBeDefined();
    expect(mockTelegramBot.sendPhoto).toBeDefined();
  });
});
