import { ThemeProvider } from "../ThemeProvider";
import { Header } from "../Header";

const mockCategories = [
  {
    id: "1",
    name: "VPS Hosting",
    slug: "vps",
    subcategories: [
      { id: "1a", name: "Linux VPS", slug: "linux" },
      { id: "1b", name: "Windows VPS", slug: "windows" },
    ],
  },
  {
    id: "2",
    name: "Dedicated Servers",
    slug: "dedicated",
    subcategories: [
      { id: "2a", name: "Intel Servers", slug: "intel" },
      { id: "2b", name: "AMD Servers", slug: "amd" },
    ],
  },
];

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header categories={mockCategories} />
    </ThemeProvider>
  );
}
