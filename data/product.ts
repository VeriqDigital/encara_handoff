// Client-supplied garment measurements and initial quantities; not live stock.
export const piece = {
  name: "The piece",
  price: "$50",
  availability: "Planned presale",
  presaleNote: "Presale details to be announced.",
  sizes: [
    { label: "S", initialQuantity: 20 },
    { label: "M", initialQuantity: 50 },
    { label: "L", initialQuantity: 50 },
  ],
  measurementUnit: "inches",
  measurements: [
    { label: "Shoulder width", values: { S: "19.25", M: "20.50", L: "21.50" } },
    { label: "Chest width (flat)", values: { S: "21.00", M: "22.50", L: "24.00" } },
    { label: "Sleeve length", values: { S: "13.50", M: "15.00", L: "15.00" } },
    { label: "Garment length", values: { S: "27.50", M: "28.75", L: "29.50" } },
  ],
  measurementNote: "Chest width is measured flat across the garment, not body circumference.",
} as const;

// Derived from the size quantities so the total stays consistent when edited.
export const initialInventoryTotal = piece.sizes.reduce((total, size) => total + size.initialQuantity, 0);
