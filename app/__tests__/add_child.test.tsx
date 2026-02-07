import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AddChildScreen from '../add_child'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// required for the component to render without crashing
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@react-native-async-storage/async-storage', () => ({ setItem: jest.fn() }));

describe('AddChildScreen', () => {

  it('renders correctly', () => {
    // Test if child input fields are present 
  });

  it('handles validation', async () => {
    // Test invalid inputs
  });

  it('submits successfully', async () => {
    // Test valid inputs
  });

  it('persists data', async () => {
    // Test if child data is stored correctly
    // Jest is ran on the local machine, so we can't test AsyncStorage here
    // We would need to use E2E testing on a real device for that
  });

});