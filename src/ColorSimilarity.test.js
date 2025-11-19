import { render, screen } from '@testing-library/react';
import App from './App';

describe('Color Conversion Functions', () => {
  test('app renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Color Similarity Finder/i)).toBeInTheDocument();
  });

  test('generates unique colors without duplicates', () => {
    render(<App />);
    const hexElements = screen.getAllByText(/^#[0-9a-f]{6}$/i);
    const hexValues = hexElements.map(el => el.textContent);
    const uniqueHexValues = [...new Set(hexValues)];
    
    expect(hexValues.length).toBe(uniqueHexValues.length);
  });
});

describe('Color Input Validation', () => {
  test('accepts valid hex color with hash', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    expect(input.value).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('displays default color on initial load', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('#3498db');
  });
});

describe('UI Components', () => {
  test('renders color input group', () => {
    render(<App />);
    const colorInputGroup = document.querySelector('.color-input-group');
    expect(colorInputGroup).toBeInTheDocument();
  });

  test('renders colors grid', () => {
    render(<App />);
    const colorsGrid = document.querySelector('.colors-grid');
    expect(colorsGrid).toBeInTheDocument();
  });

  test('each color card has preview and info sections', () => {
    render(<App />);
    const colorCards = document.querySelectorAll('.color-card');
    colorCards.forEach(card => {
      expect(card.querySelector('.color-preview')).toBeInTheDocument();
      expect(card.querySelector('.color-info')).toBeInTheDocument();
    });
  });

  test('color info displays name and hex value', () => {
    render(<App />);
    const colorInfos = document.querySelectorAll('.color-info');
    colorInfos.forEach(info => {
      expect(info.querySelector('.color-name')).toBeInTheDocument();
      expect(info.querySelector('.color-hex')).toBeInTheDocument();
    });
  });
});
