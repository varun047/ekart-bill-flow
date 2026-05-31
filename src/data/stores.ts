export type Store = {
  id: string;
  name: string;
  distance: string;
  address: string;
  isOpen: boolean;
  ekartId: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  location: string;
};

export type CartStatus = "available" | "in_use" | "offline";

export type CartInfo = {
  id: string;
  label: string;
  status: CartStatus;
  location: string;
};

export const STORES: Store[] = [
  {
    id: "1",
    name: "RimJhim Store",
    distance: "0.4 km",
    address: "Shopping Complex",
    isOpen: true,
    ekartId: "FM-1423",
  },
  {
    id: "2",
    name: "Yadav Store",
    distance: "0.1 km",
    address: "Behind Mathematics Depttt", 
    isOpen: true,
    ekartId: "DN-9082",
  },
  {
    id: "3",
    name: "D-Mart",
    distance: "12.3 km",
    address: "PTK Bypass Chowk",
    isOpen: false,
    ekartId: "CC-7710",
  },
];

export const STORE_INVENTORY: Record<string, InventoryItem[]> = {
  "1": [
    {
      id: "fm-01",
      name: "Full Cream Milk 1L",
      category: "Dairy",
      price: "₹68",
      stock: 42,
      location: "Aisle 3 · Dairy chiller",
    },
    {
      id: "fm-02",
      name: "Brown Bread (400g)",
      category: "Bakery",
      price: "₹45",
      stock: 23,
      location: "Aisle 1 · Bakery rack",
    },
    {
      id: "fm-03",
      name: "Premium Basmati Rice 5kg",
      category: "Grains",
      price: "₹620",
      stock: 15,
      location: "Aisle 5 · Grains & pulses",
    },
    {
      id: "fm-04",
      name: "Organic Eggs (12 pcs)",
      category: "Dairy",
      price: "₹165",
      stock: 8,
      location: "Aisle 3 · Dairy chiller (top shelf)",
    },
  ],
  "2": [
    {
      id: "dn-01",
      name: "Family Oil Pack 5L",
      category: "Essentials",
      price: "₹899",
      stock: 11,
      location: "Aisle 4 · Cooking oils",
    },
    {
      id: "dn-02",
      name: "Instant Noodles (Multi-pack)",
      category: "Snacks",
      price: "₹120",
      stock: 40,
      location: "Aisle 6 · Snacks & noodles",
    },
    {
      id: "dn-03",
      name: "Assorted Biscuits Box",
      category: "Snacks",
      price: "₹199",
      stock: 17,
      location: "Aisle 2 · Biscuits & cookies",
    },
  ],
  "3": [
    {
      id: "cc-01",
      name: "Tomatoes (1kg)",
      category: "Fresh Produce",
      price: "₹38",
      stock: 26,
      location: "Fresh zone · Bin 4",
    },
    {
      id: "cc-02",
      name: "Potatoes (1kg)",
      category: "Fresh Produce",
      price: "₹34",
      stock: 31,
      location: "Fresh zone · Bin 2",
    },
  ],
};

export const STORE_CARTS: Record<string, CartInfo[]> = {
  "1": [
    { id: "FM-C1", label: "Cart A1", status: "in_use", location: "Aisle 3 · Dairy" },
    { id: "FM-C2", label: "Cart A2", status: "available", location: "Entrance dock" },
    { id: "FM-C3", label: "Cart A3", status: "in_use", location: "Billing counter 2" },
  ],
  "2": [
    { id: "DN-C1", label: "Cart H1", status: "available", location: "Electronics zone" },
    { id: "DN-C2", label: "Cart H2", status: "offline", location: "Service bay" },
  ],
  "3": [{ id: "CC-C1", label: "Cart S1", status: "available", location: "Front door" }],
};

export const getStoreById = (id: string): Store | undefined =>
  STORES.find((store) => store.id === id);

