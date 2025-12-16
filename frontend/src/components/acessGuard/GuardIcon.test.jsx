import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import GuardIcon from "./GuardIcon";

// Mock SvgIcon pour inspecter les props passées
vi.mock("../common/SvgIcon", () => ({
  default: ({ pathD, className }) => (
    <svg data-testid="svg-icon" data-path={pathD} className={className} />
  ),
}));

describe("GuardIcon Component", () => {
  it("renders correct path for 'error' type", () => {
    const { getByTestId } = render(<GuardIcon type="error" />);
    const icon = getByTestId("svg-icon");
    
    // Vérifie qu'un path spécifique à l'erreur est passé
    expect(icon).toHaveAttribute("data-path", expect.stringContaining("M12 8v4m0 4h.01"));
    expect(icon).toHaveClass("text-red-500");
  });

  it("renders correct path for 'unauthorized' type", () => {
    const { getByTestId } = render(<GuardIcon type="unauthorized" />);
    const icon = getByTestId("svg-icon");
    
    // Vérifie le path spécifique unauthorized
    expect(icon).toHaveAttribute("data-path", expect.stringContaining("M12 15v2m-6 4h12"));
  });

  it("renders empty path for unknown type", () => {
    const { getByTestId } = render(<GuardIcon type="unknown" />);
    const icon = getByTestId("svg-icon");
    
    expect(icon).toHaveAttribute("data-path", "");
  });
});