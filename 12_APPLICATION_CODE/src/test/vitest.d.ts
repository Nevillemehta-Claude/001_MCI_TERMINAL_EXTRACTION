/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toHaveAttribute(attr: string, value?: string): void;
      toHaveClass(...classNames: string[]): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeVisible(): void;
      toHaveValue(value: string | number | string[]): void;
      toHaveFocus(): void;
      toBeChecked(): void;
      toBePartiallyChecked(): void;
      toHaveStyle(style: Record<string, unknown>): void;
      toContainElement(element: HTMLElement | null): void;
      toContainHTML(html: string): void;
      toBeEmpty(): void;
      toBeEmptyDOMElement(): void;
      toBeInvalid(): void;
      toBeRequired(): void;
      toBeValid(): void;
      toHaveAccessibleDescription(description?: string | RegExp): void;
      toHaveAccessibleName(name?: string | RegExp): void;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): void;
      toHaveErrorMessage(message?: string | RegExp): void;
    }
  }
}

export {};
