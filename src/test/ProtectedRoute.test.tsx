import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

// Mock ProtectedRoute as it wraps auth logic
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const mockedUseAuth = vi.mocked(useAuth);

const renderWithRouter = (
  authValues: ReturnType<typeof useAuth>,
  path = "/admin",
) => {
  mockedUseAuth.mockReturnValue(authValues);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  it("shows loading spinner while auth is loading", () => {
    renderWithRouter({
      user: null,
      session: null,
      isAdmin: false,
      isBoardMember: false,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
    expect(screen.getByText(/checking access/i)).toBeInTheDocument();
  });

  it("redirects to /auth when no user is present", () => {
    renderWithRouter({
      user: null,
      session: null,
      isAdmin: false,
      isBoardMember: false,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children when user is admin", () => {
    renderWithRouter({
      user: { id: "u1", email: "a@b.com" } as ReturnType<typeof useAuth>["user"],
      session: {} as ReturnType<typeof useAuth>["session"],
      isAdmin: true,
      isBoardMember: true,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
