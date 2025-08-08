describe('Basic Setup', () => {
  it('should have working test environment', () => {
    expect(1 + 1).toBe(2);
  });

  it('should be able to import modules', () => {
    // Test that we can import our main modules
    expect(() => {
      require('../lib/supabase');
    }).not.toThrow();
  });
}); 