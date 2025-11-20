import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('color-name-list', () => ({
  colornames: [
    { name: 'red', hex: '#FF0000' },
    { name: 'blue', hex: '#0000FF' },
    { name: 'green', hex: '#00FF00' },
    { name: 'coral', hex: '#FF7F50' }
  ]
}));

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

describe('HTML Injection Security', () => {
  test('prevents XSS via script tag injection in color input', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    // Attempt to inject a script tag
    const xssPayload = '<script>alert("xss")</script>';
    fireEvent.change(input, { target: { value: xssPayload } });

    // Verify no script elements were created
    const scripts = document.querySelectorAll('script');
    const appScripts = Array.from(scripts).filter(script =>
      script.textContent.includes('alert("xss")')
    );
    expect(appScripts.length).toBe(0);

    // Verify the malicious string doesn't appear as executable code
    expect(document.body.innerHTML).not.toMatch(/<script>alert\("xss"\)<\/script>/);
  });

  test('prevents XSS via img tag with onerror handler', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    // Attempt to inject an image with onerror handler
    const xssPayload = '<img src=x onerror=alert("xss")>';
    fireEvent.change(input, { target: { value: xssPayload } });

    // Verify no img elements with onerror were created
    const images = document.querySelectorAll('img[onerror]');
    expect(images.length).toBe(0);

    // Verify the error message is displayed safely
    const errorMessage = screen.queryByText(/Color name not recognized/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('prevents XSS via javascript: protocol', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    const xssPayload = 'javascript:alert("xss")';
    fireEvent.change(input, { target: { value: xssPayload } });

    // Should show error message, not execute
    const errorMessage = screen.queryByText(/Color name not recognized/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('escapes HTML special characters in rendered content', () => {
    render(<App />);

    // Get color names from the DOM
    const colorNames = document.querySelectorAll('.color-name');

    // Check that HTML special characters are properly escaped
    colorNames.forEach(nameElement => {
      const text = nameElement.textContent;

      // If the text contains what looks like HTML, it should be as text, not tags
      if (text.includes('<') || text.includes('>')) {
        // The element should contain text nodes, not child elements with those names
        expect(nameElement.innerHTML).toBe(nameElement.textContent);
      }
    });
  });

  test('prevents CSS injection via hex color input', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    // Attempt CSS injection
    const cssInjection = '#ffffff; background:red; position:fixed;';
    fireEvent.change(input, { target: { value: cssInjection } });

    // Verify no injected CSS made it to the color preview styles
    const colorPreviews = document.querySelectorAll('.color-preview');
    colorPreviews.forEach(preview => {
      const style = preview.getAttribute('style');
      if (style) {
        // Should not contain any of the injected CSS properties
        expect(style).not.toContain('position:fixed');
        expect(style).not.toContain('background:red');
        // Should only contain valid backgroundColor property
        expect(style).toMatch(/background-color/i);
      }
    });

    // Verify the malicious string doesn't appear in any inline styles
    const allElements = document.querySelectorAll('[style]');
    allElements.forEach(element => {
      const style = element.getAttribute('style');
      expect(style).not.toContain('position:fixed');
      expect(style).not.toContain('; background:red;');
    });
  });

  test('prevents CSS injection via style attribute injection', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    const cssInjection = '#fff" style="background:red';
    fireEvent.change(input, { target: { value: cssInjection } });

    // Verify color preview elements don't have injected styles
    const colorPreviews = document.querySelectorAll('.color-preview');
    colorPreviews.forEach(preview => {
      const style = preview.getAttribute('style');
      // Should only contain backgroundColor, not injected styles
      if (style) {
        expect(style).not.toContain('background:red');
      }
    });
  });

  test('maintains DOM integrity with malicious input', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    const maliciousInputs = [
      '"><script>alert(1)</script><span class="',
      '<img src=x onerror=alert(1)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '</div><script>alert(1)</script><div>',
      'red\'; background-image: url(javascript:alert(1)); \''
    ];

    maliciousInputs.forEach(payload => {
      fireEvent.change(input, { target: { value: payload } });
    });

    // Verify no malicious elements were created
    expect(document.querySelectorAll('iframe').length).toBe(0);
    expect(document.querySelectorAll('script[src]').length).toBe(0);

    // Verify expected structure is maintained
    expect(screen.getByText(/Color Similarity Finder/i)).toBeInTheDocument();
    expect(document.querySelector('.color-input-group')).toBeInTheDocument();
  });

  test('prevents injection through very long strings', () => {
    render(<App />);
    const input = screen.getByRole('textbox');

    // Create a very long string with HTML
    const longPayload = '<script>alert("xss")</script>'.repeat(1000);
    fireEvent.change(input, { target: { value: longPayload } });

    // App should still function
    expect(screen.getByText(/Color Similarity Finder/i)).toBeInTheDocument();

    // No scripts should be created
    const scripts = Array.from(document.querySelectorAll('script'));
    const maliciousScripts = scripts.filter(s => s.textContent.includes('alert("xss")'));
    expect(maliciousScripts.length).toBe(0);
  });

  test('color hex values are always valid format', () => {
    render(<App />);

    const hexElements = document.querySelectorAll('.color-hex');
    hexElements.forEach(hexElement => {
      const hexValue = hexElement.textContent;

      // Must match strict hex format
      expect(hexValue).toMatch(/^#[0-9a-f]{6}$/i);

      // Should not contain any HTML or script content
      expect(hexValue).not.toContain('<');
      expect(hexValue).not.toContain('>');
      expect(hexValue).not.toContain('script');
      expect(hexValue).not.toContain('onerror');
    });
  });

  test('color names do not contain executable code', () => {
    render(<App />);

    const nameElements = document.querySelectorAll('.color-name');
    nameElements.forEach(nameElement => {
      const name = nameElement.textContent;

      // Should not contain script-related content
      expect(name).not.toContain('<script');
      expect(name).not.toContain('javascript:');
      expect(name).not.toContain('onerror=');
      expect(name).not.toContain('onclick=');

      // Text content should match innerHTML (no nested tags)
      expect(nameElement.innerHTML).toBe(nameElement.textContent);
    });
  });
});
