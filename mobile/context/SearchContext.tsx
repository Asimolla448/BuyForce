import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import api from "../app/api";
import { Category, useCategoryContext } from "./CategoryContext";

export interface Product {
  id: number;
  name: string;
  category: string;
  mainImage: string; 
  status: "ACTIVE" | "COMPLETED" | "FAILED";
}

interface ProductSearchResult {
  type: "product";
  id: number;
  name: string;
  mainImage: string;
}

interface CategorySearchResult {
  type: "category";
  name: string;
}

type SearchResult = ProductSearchResult | CategorySearchResult;

interface SearchContextType {
  products: Product[];
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  fetchData: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { categories } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const fetchData = async () => {
    try {
      const res = await api.get<Product[]>("/products");
      setProducts(res.data.filter((p) => p.status === "ACTIVE"));
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const categoryResults: CategorySearchResult[] = categories
      .filter((c) => c.name.toLowerCase().includes(lower))
      .map((c) => ({ type: "category", name: c.name }));

    const productResults: ProductSearchResult[] = products
      .filter((p) => p.name.toLowerCase().includes(lower))
      .map((p) => ({
        type: "product",
        id: p.id,
        name: p.name,
        mainImage: p.mainImage,
      }));

    setSearchResults([...categoryResults, ...productResults]);
  }, [searchTerm, categories, products]);

  return (
    <SearchContext.Provider
      value={{
        products,
        categories,
        searchTerm,
        setSearchTerm,
        searchResults,
        fetchData,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};
