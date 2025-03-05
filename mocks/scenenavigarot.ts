export const mockSceneNavigator = {
  getAvailableNextScenes: jest.fn(),
  setScene: jest.fn(),
  goBack: jest.fn(),
};

// Remove test suite error by adding a dummy test
describe("Scene Navigator Mock", () => {
  it("should provide mock methods", () => {
    expect(mockSceneNavigator.getAvailableNextScenes).toBeDefined();
    expect(mockSceneNavigator.setScene).toBeDefined();
    expect(mockSceneNavigator.goBack).toBeDefined();
  });
});
