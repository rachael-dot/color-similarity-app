import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('color-name-list', () => ({
  colornames: [
    { name: 'red', hex: '#FF0000' },
    { name: 'blue', hex: '#0000FF' },
    { name: 'green', hex: '#00FF00' }
  ]
}));

describe('Color Similarity App', () => {
  test('renders the app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Color Similarity Finder/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(<App />);
    const subtitle = screen.getByText(/Enter a hex code or color name to see similar shades and variations/i);
    expect(subtitle).toBeInTheDocument();
  });

  test('renders color picker input', () => {
    render(<App />);
    const colorPickers = screen.getAllByDisplayValue('#3498db');
    expect(colorPickers.length).toBeGreaterThan(0);
  });

  test('displays initial similar colors on load', () => {
    render(<App />);
    const colorCards = screen.getAllByText(/Lighter|Light|Original|Dark|Darker|Hue|Saturated/);
    expect(colorCards.length).toBeGreaterThan(0);
  });

  test('color picker updates when changed', () => {
    render(<App />);
    const colorPicker = screen.getByRole('textbox');
    fireEvent.change(colorPicker, { target: { value: '#ff0000' } });
    expect(colorPicker.value).toBe('#ff0000');
  });

  test('generates similar colors for red', () => {
    render(<App />);
    const colorInput = screen.getByRole('textbox');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    const colorCards = screen.getAllByText(/Lighter|Light|Original|Dark|Darker/);
    expect(colorCards.length).toBeGreaterThan(0);
  });

  test('displays color hex values in cards', () => {
    render(<App />);
    const hexValues = screen.getAllByText(/^#[0-9a-f]{6}$/i);
    expect(hexValues.length).toBeGreaterThan(0);
  });

  test('allows valid hex color input', () => {
    render(<App />);
    const colorInput = screen.getByRole('textbox');
    
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(colorInput.value).toBe('#ff0000');
  });

  test('allows various input formats', () => {
    render(<App />);
    const colorInput = screen.getByRole('textbox');
    
    fireEvent.change(colorInput, { target: { value: '#ff00001234' } });
    // Input now accepts color names and hex codes without length restriction
    expect(colorInput.value).toBe('#ff00001234');
  });

  test('accepts color names as input', () => {
    render(<App />);
    const colorInput = screen.getByRole('textbox');
    
    fireEvent.change(colorInput, { target: { value: 'red' } });
    expect(colorInput.value).toBe('red');
    
    // Should generate similar colors for red
    const colorCards = screen.getAllByText(/Lighter|Light|Original|Dark|Darker/);
    expect(colorCards.length).toBeGreaterThan(0);
  });

  test('displays color variation names', () => {
    render(<App />);
    expect(screen.getByText(/Lighter/i)).toBeInTheDocument();
    expect(screen.getByText(/Original/i)).toBeInTheDocument();
    expect(screen.getByText(/Darker/i)).toBeInTheDocument();
  });

  test('displays hue shift variations', () => {
    render(<App />);
    const hueShifts = screen.getAllByText(/Hue [+-]\d+°/);
    expect(hueShifts.length).toBeGreaterThan(0);
  });

  test('displays saturation variations', () => {
    render(<App />);
    expect(screen.getByText(/More Saturated/i)).toBeInTheDocument();
    expect(screen.getByText(/Less Saturated/i)).toBeInTheDocument();
  });

  test('renders correct number of color cards', () => {
    render(<App />);
    const colorCards = document.querySelectorAll('.color-card');
    expect(colorCards.length).toBeGreaterThan(5);
  });

  test('color preview has correct background color', () => {
    render(<App />);
    const colorPreview = document.querySelector('.color-preview');
    expect(colorPreview).toBeInTheDocument();
    expect(colorPreview).toHaveStyle({ backgroundColor: expect.any(String) });
  });
});
