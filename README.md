# Advanced Barcode & Label Printer

A powerful, high-precision web application designed to generate, format, and print industrial-grade labels and barcodes directly from your browser. Built with **Next.js**, **React**, and **Tailwind CSS**, it bridges the gap between raw CSV data and physical Avery label sheets with pixel-perfect precision.

## 🚀 Key Features

### 📊 Dynamic Data Integration
- **CSV Upload:** Seamlessly import massive datasets using standard CSV files.
- **Smart Column Mapping:** Dynamically map CSV columns to barcode values, multiple text fields, and even a "Quantity" column to automatically print exact numbers of specific labels.
- **Global Copies:** Set a base multiplier to print multiple copies of your entire dataset.

### 🎨 Master Design Interface
- **Drag-and-Drop Positioning:** Click and drag any text field, shape, or barcode directly on the Master Design Preview to position them flawlessly.
- **Visual Scaling:** Resize elements intuitively using interactive bounding-box drag handles.
- **Custom Shapes:** Add and manipulate separator lines (vertical/horizontal) and bounding boxes to frame your data.

### 🔲 Advanced Barcode Engine
- **Multiple Formats Supported:** CODE128, EAN13, EAN8, UPC, CODE39, ITF14, MSI, Pharmacode.
- **Barcode Duplication:** Clone barcodes effortlessly and position them independently around the label.
- **Rich Text Control:**
  - Toggle barcode value text visibility.
  - Choose text positioning: **Top, Bottom, Left, or Right**.
  - Customize font styling: adjust font size, toggle bold weight, and select from multiple font families (Monospace, Arial, Times New Roman, etc.).

### 🖨️ Production-Ready Printing
- **Printer Calibration:** High-precision top and left offset adjustments (down to 0.01 inches) to perfectly align with physical printer hardware and avoid margin drift.
- **Template Support:** Built-in templates for standard Avery sheets (e.g., 5160, 5167).
- **Conditional Visibility:** Configure specific elements or barcodes to only print on odd/even columns or odd/even labels (useful for multi-part tags).
- **Optimized Print Preview:** View all generated pages before hitting print. Use the "Show" dropdown to limit screen rendering when dealing with thousands of labels to maintain browser performance, while ensuring all labels still print perfectly.
- **Template Saving:** Save your mappings, styles, calibrations, and shapes to LocalStorage for quick retrieval in the future.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Barcode Rendering:** `react-barcode` / `jsbarcode`
- **State Management:** React Hooks (`useState`, `useMemo`) + LocalStorage Persistence

---

## 💻 Getting Started

First, clone the repository and install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📖 Quick Usage Guide

1. **Import Data:** Use the left sidebar to upload a `.csv` file. 
2. **Map Columns:** Select which CSV column should be used for the Barcode value, and which should be mapped to the text fields. (Optional: Map a quantity column).
3. **Design the Label:** Switch to the **Design Mode** tab. Use the right sidebar to add columns, tweak barcode formats, and spawn custom shapes.
4. **Drag & Resize:** On the central Master Design Preview, click any element to activate its bounding box. Drag from the center to move it, or drag the edges to scale it.
5. **Calibrate:** Do a test print on plain paper and hold it up to the light against your label sheet. Use the `Printer Alignment` controls in the right sidebar to adjust the global offsets if your printer's margins are slightly off.
6. **Print:** Switch to the **Sheet Preview** tab, verify the layout, and click the **Print** button in the left sidebar.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).
