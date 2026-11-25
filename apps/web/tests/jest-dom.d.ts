// makes this file a module so that declare module below is an augmentation
export {};

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<R extends void | Promise<void> = void, T = unknown> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeEmpty(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveFocus(): R;
    toHaveAttribute(attr: string, value?: unknown): R;
    toHaveClass(...classNames: string[]): R;
    toHaveStyle(css: string | Record<string, unknown>): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
    toHaveValue(value?: string | string[] | number | null): R;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    toHaveFormValues(expectedValues: Record<string, unknown>): R;
    toHaveAccessibleDescription(description?: string | RegExp): R;
    toHaveAccessibleName(name?: string | RegExp): R;
    toHaveErrorMessage(text?: string | RegExp): R;
    toContainElement(element: HTMLElement | SVGElement | null): R;
    toContainHTML(htmlText: string): R;
  }
  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): void;
    toBeDisabled(): void;
    toBeEnabled(): void;
    toHaveClass(...classNames: string[]): void;
    toHaveAttribute(attr: string, value?: unknown): void;
    toHaveTextContent(text: string | RegExp): void;
  }
}
