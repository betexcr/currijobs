import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Text } from 'react-native';

// Test component to access auth context
const TestComponent = () => {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="loading">{loading ? 'Loading' : 'Not Loading'}</Text>
      <Text testID="user">{user ? user.email : 'No User'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeTruthy();
    expect(screen.getByTestId('user')).toBeTruthy();
  });

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
}); 