import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdminLayout from "@/components/AdminLayout";

// Mock useAuth to avoid Supabase dependency
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false }),
}));

describe("AdminLayout", () => {
  it("renders the accent heading and children", () => {
    render(
      <AdminLayout title="Test" accent="Members">
        <p>Child content</p>
      </AdminLayout>,
    );
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("shows loading state when loading prop is true", () => {
    render(
      <AdminLayout title="Test" accent="Members" loading={true}>
        <p>Child content</p>
      </AdminLayout>,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("Child content")).not.toBeInTheDocument();
  });

  it("renders header action when provided", () => {
    render(
      <AdminLayout title="Test" accent="Board" headerAction={<button>New</button>}>
        <p>Content</p>
      </AdminLayout>,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies custom maxWidth class", () => {
    const { container } = render(
      <AdminLayout title="Test" accent="Gallery" maxWidth="max-w-3xl">
        <p>Content</p>
      </AdminLayout>,
    );
    const inner = container.querySelector(".max-w-3xl");
    expect(inner).toBeInTheDocument();
  });
});
