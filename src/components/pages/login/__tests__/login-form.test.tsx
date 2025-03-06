
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "../login-form";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

// Mock zustand store
vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    setUser: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByText("Login to your account")).toBeDefined();
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Select a room to enter")).toBeDefined();
    expect(screen.getByRole("button", { name: "Login" })).toBeDefined();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeDefined();
      expect(screen.getByText("Room is required")).toBeDefined();
    });
  });

  it("submits form with valid data", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ token: "fake-token" }), { status: 200 })
      )
    );
    global.fetch = mockFetch;

    render(<LoginForm />);

    // Fill form using placeholder text instead of label
    fireEvent.change(screen.getByPlaceholderText("Input your name"), {
      target: { value: "Test User" },
    });

    // Select room - using more specific selectors
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);
    const roomOption = screen.getByRole("option", { name: "Room 1" });
    fireEvent.click(roomOption);

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        body: JSON.stringify({ name: "Test User", room: "room1" }),
      });
    });
  });
});
