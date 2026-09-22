import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ColumnPicker from "./ColumnPicker";
import type { DataTableColumn } from "../lib/types";

interface Org {
  id: number;
  name: string;
  status: string;
}

const COLUMNS: DataTableColumn<Org>[] = [
  { key: "name", header: "Name" },
  { key: "status", header: "Status" },
];

describe("ColumnPicker", () => {
  it("is closed until the Columns button is clicked", () => {
    render(<ColumnPicker columns={COLUMNS} hiddenColumns={new Set()} onToggleColumn={vi.fn()} onMoveColumn={vi.fn()} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByRole("checkbox", { name: "Name" })).toBeInTheDocument();
  });

  it("checks a column unless it's hidden", () => {
    render(
      <ColumnPicker columns={COLUMNS} hiddenColumns={new Set(["status"])} onToggleColumn={vi.fn()} onMoveColumn={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));

    expect(screen.getByRole("checkbox", { name: "Name" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Status" })).not.toBeChecked();
  });

  it("calls onToggleColumn with the column's key", () => {
    const onToggleColumn = vi.fn();
    render(<ColumnPicker columns={COLUMNS} hiddenColumns={new Set()} onToggleColumn={onToggleColumn} onMoveColumn={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Status" }));
    expect(onToggleColumn).toHaveBeenCalledWith("status");
  });

  it("disables move-up for the first column and move-down for the last", () => {
    render(<ColumnPicker columns={COLUMNS} hiddenColumns={new Set()} onToggleColumn={vi.fn()} onMoveColumn={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));

    expect(screen.getByRole("button", { name: "Move name up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move status down" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move name down" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Move status up" })).not.toBeDisabled();
  });

  it("calls onMoveColumn with the column's key and direction", () => {
    const onMoveColumn = vi.fn();
    render(<ColumnPicker columns={COLUMNS} hiddenColumns={new Set()} onToggleColumn={vi.fn()} onMoveColumn={onMoveColumn} />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));

    fireEvent.click(screen.getByRole("button", { name: "Move status up" }));
    expect(onMoveColumn).toHaveBeenCalledWith("status", -1);
  });
});
