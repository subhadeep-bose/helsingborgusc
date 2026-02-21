import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PageHeader from "@/components/PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Hello World" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello World");
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Title" subtitle="Some subtitle" />);
    expect(screen.getByText("Some subtitle")).toBeInTheDocument();
  });

  it("omits subtitle when not provided", () => {
    render(<PageHeader title="Title" />);
    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });
});
