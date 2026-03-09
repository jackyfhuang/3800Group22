import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ChildCaptureCard } from '../../components/child-capture-card';
import type { ChildFormData } from '../(tabs)/add_child';

// Mock view-shot to a plain component to avoid native bindings during tests
jest.mock('react-native-view-shot', () => {
  const ReactViewShot = require('react');
  return {
    __esModule: true,
    default: ReactViewShot.forwardRef((props: any, ref: any) => {
      return ReactViewShot.createElement('ViewShot', { ...props, ref });
    }),
  };
});

const baseData: ChildFormData = {
  fullName: 'Jane Doe',
  age: 8,
  height: 130,
  weight: 30,
  gender: 'Female',
  medicalNotes: 'Peanut allergy',
  hasBirthmarks: 'yes',
  birthmarksDescription: 'Small mark on left arm',
  hasScars: 'no',
  scarsDescription: '',
  hasIdentifyingFeatures: 'yes',
  identifyingFeaturesDescription: 'Freckles on nose',
  lastKnownLocation: 'Central Park',
  schoolDaycareType: 'school',
  schoolDaycareName: 'Lincoln Elementary',
  sportsTeams: 'Soccer',
  parent1Name: '',
  parent1Address: '',
  parent1Phone: '',
  parent2Name: '',
  parent2Address: '',
  parent2Phone: '',
  emergencyContacts: [
    {
      name: 'Alice Doe',
      relationship: 'Mother',
      sex: 'Female',
      phone: '123-456-7890',
      address: '123 Maple St',
    },
  ],
};

describe('ChildCaptureCard', () => {
  it('renders fallback values when data is null', () => {
    const ref = React.createRef<any>();
    render(<ChildCaptureCard viewShotRef={ref} data={null} />);

    expect(screen.getByText('Child Guard ID')).toBeTruthy();
    expect(screen.getByText('Name missing')).toBeTruthy();
    expect(screen.getByText('Medical Notes')).toBeTruthy();
    expect(screen.getByText('None provided')).toBeTruthy();
  });

  it('renders all provided child details', () => {
    const ref = React.createRef<any>();
    render(<ChildCaptureCard viewShotRef={ref} data={baseData} />);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.getByText('130')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('Central Park')).toBeTruthy();
    expect(screen.getByText('Lincoln Elementary')).toBeTruthy();
    expect(screen.getByText('Peanut allergy')).toBeTruthy();
    expect(screen.getByText('Birthmarks: Small mark on left arm')).toBeTruthy();
    expect(screen.getByText('Other Features: Freckles on nose')).toBeTruthy();
    expect(screen.getByText('Alice Doe (Mother) - 123-456-7890')).toBeTruthy();
  });
});
