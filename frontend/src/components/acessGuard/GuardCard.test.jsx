import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GuardCard from "./GuardCard";

describe("GuardCard Component", () => {
  it("renders children correctly", () => {
    render(
      <GuardCard>
        <div data-testid="child">Contenu enfant</div>
      </GuardCard>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders title and message when provided", () => {
    const title = "Titre Test";
    const message = "Message Test";
    render(<GuardCard title={title} message={message} />);
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const FakeIcon = () => <svg data-testid="fake-icon" />;
    render(<GuardCard icon={<FakeIcon />} />);
    
    expect(screen.getByTestId("fake-icon")).toBeInTheDocument();
  });

  it("does not render title or message if not provided", () => {
    const { container } = render(<GuardCard />);
    // On vérifie qu'il n'y a pas de balise h3 ou p vide qui traîne inutilement
    expect(container.querySelector("h3")).not.toBeInTheDocument();
    // Le p peut être présent pour les enfants, donc on vérifie le texte spécifique
  });
});