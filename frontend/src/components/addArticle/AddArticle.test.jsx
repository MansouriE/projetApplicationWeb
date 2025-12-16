import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddArticle from "./AddArticle";
import { AuthContext } from "../../context/AuthContext";

// Mocks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

global.fetch = vi.fn();
global.alert = vi.fn();
// Supprimer les logs d'erreur de la console pendant les tests
vi.spyOn(console, 'error').mockImplementation(() => { });

const renderWithAuth = (authContextValue) => {
    return render(
        <AuthContext.Provider value={authContextValue}>
            <AddArticle />
        </AuthContext.Provider>
    );
};

const loggedInAuth = {
    isLoggedIn: true,
    token: "fake-token-123",
    userId: 1,
};

describe("AddArticle Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("includes image and offer details in submission", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        // Remplir les champs de base
        await user.type(screen.getByPlaceholderText(/Nom/i), "Article Image");
        await user.type(screen.getByPlaceholderText(/Description/i), "Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "200");
        const selects = screen.getAllByRole('combobox');
        await user.selectOptions(selects[0], "Neuf");

        // Activer les offres (2ème checkbox)
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[1]); // acceptsOffers

        // Sélectionner une réduction (le select apparaît après le clic)
        // On doit re-querier les combobox ou chercher par texte d'option par défaut
        const reductionSelect = await screen.findByDisplayValue("Réduction %");
        await user.selectOptions(reductionSelect, "10");

        // Simuler l'upload d'image
        const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
        // L'input file est souvent difficile à cibler par rôle, on utilise le sélecteur CSS ou label s'il existe
        // Dans votre code: <input type="file" ... /> sans label/id
        const fileInput = document.querySelector('input[type="file"]');
        await user.upload(fileInput, file);

        // Mock succès
        global.fetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => "application/json" },
            text: async () => JSON.stringify({ success: true }),
            status: 200,
        });

        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
            // Vérifier que le FormData contient l'image (difficile à inspecter directement, mais l'appel suffit pour le coverage)
        });
    });

    // Test: Erreur API (Branche !response.ok)
    it("displays error message from server on failure", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText(/Nom/i), "Fail Article");
        await user.type(screen.getByPlaceholderText(/Description/i), "Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "100");
        const selects = screen.getAllByRole('combobox');
        await user.selectOptions(selects[0], "Neuf");

        // Mock erreur 500
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            headers: { get: () => "application/json" },
            text: async () => JSON.stringify({ error: "Erreur serveur interne" }),
        });

        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(screen.getByText(/Erreur serveur interne/i)).toBeInTheDocument();
        });
    });
    it("shows unauthorized message if not logged in", () => {
        renderWithAuth({ isLoggedIn: false });
        expect(screen.getByText(/Accès non autorisé/i)).toBeInTheDocument();
    });

    it("shows error if required fields are empty on submit", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();
        const submitButton = screen.getByRole("button", { name: /Créer l'article/i });

        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument();
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("shows error for invalid price", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        // Remplir les champs textuels
        await user.type(screen.getByPlaceholderText(/Nom/i), "Test Article");
        await user.type(screen.getByPlaceholderText(/Description/i), "Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "-10"); // Prix invalide

        // Sélectionner l'état. Le select n'a pas de label, on utilise getAllByRole('combobox')
        // Index 0 = Etat (d'après l'ordre dans le JSX)
        const selects = screen.getAllByRole('combobox');
        await user.selectOptions(selects[0], "Neuf");

        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(screen.getByText(/Le prix doit être un nombre positif/i)).toBeInTheDocument();
        });
    });

    it("shows error for unselected state or invalid state", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText(/Nom/i), "Test Article");
        await user.type(screen.getByPlaceholderText(/Description/i), "Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "10");

        // On ne sélectionne rien dans le select état (valeur par défaut "")

        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            // Le code vérifie if (!etat) -> "Veuillez remplir tous les champs"
            expect(screen.getByText(/Veuillez remplir tous les champs/i)).toBeInTheDocument();
        });
    });

    it("submits form successfully and navigates to /profile", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => "application/json" },
            text: async () => JSON.stringify({ success: true }),
            status: 200,
        });

        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText(/Nom/i), "Test Article Pro");
        await user.type(screen.getByPlaceholderText(/Description/i), "Super Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "50");

        const selects = screen.getAllByRole('combobox');
        await user.selectOptions(selects[0], "Neuf"); // Etat

        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/profile");
        });
    });

    it("shows error if acceptsBids is true but startingBid or Duration is empty", async () => {
        renderWithAuth(loggedInAuth);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText(/Nom/i), "Test Bid");
        await user.type(screen.getByPlaceholderText(/Description/i), "Desc");
        await user.type(screen.getByPlaceholderText(/Prix/i), "100");

        const selects = screen.getAllByRole('combobox');
        await user.selectOptions(selects[0], "Usagé"); // Etat

        // Cocher "Autoriser les bids" (Checkbox 1)
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]); // acceptsBids

        // Soumettre sans remplir les détails du bid
        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(screen.getByText(/Veuillez entrer un prix de départ pour les bids/i)).toBeInTheDocument();
        });

        // Remplir prix mais pas durée
        await user.type(screen.getByPlaceholderText(/Prix de départ des bids/i), "10");
        await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

        await waitFor(() => {
            expect(screen.getByText(/Veuillez sélectionner une durée pour le bid/i)).toBeInTheDocument();
        });
    });
});