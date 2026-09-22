import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("shows the current page and total", () => {
    render(<Pagination page={2} pageCount={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("calls onPageChange with page - 1 / page + 1", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("disables Prev on the first page and Next on the last page", () => {
    render(<Pagination page={1} pageCount={1} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("omits the page-size select when its props aren't all given", () => {
    render(<Pagination page={1} pageCount={3} onPageChange={vi.fn()} />);
    expect(screen.queryByLabelText("Page size")).not.toBeInTheDocument();
  });

  it("renders and wires the page-size select when given", () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageCount={3}
        onPageChange={vi.fn()}
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Page size"), { target: { value: "50" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
