import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders todo heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /your tasks/i })).toBeInTheDocument();
});
