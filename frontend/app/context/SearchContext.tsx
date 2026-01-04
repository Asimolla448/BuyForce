'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import api from '../api';
import { Category, useCategoryContext } from './CategoryContext';

export interface Product {
  id: number;
  name: string;
  category: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

interface SearchContextType {
  products: Product[];
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: { type: 'product' | 'category'; id?: number; name: string }[];
  fetchData: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { categories } = useCategoryContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchContextType['searchResults']>([]);

  const fetchData = async () => {
    try {
      const res = await api.get<Product[]>('/products');
      setTimeout(() => {
        setProducts(res.data.filter(p => p.status === 'ACTIVE'));
      }, 0);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateResults = () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      const lower = searchTerm.toLowerCase();

      const categoryResults = categories
        .filter(c => c.name.toLowerCase().includes(lower))
        .map(c => ({ type: 'category' as const, name: c.name }));

      const productResults = products
        .filter(p => p.name.toLowerCase().includes(lower))
        .map(p => ({ type: 'product' as const, id: p.id, name: p.name }));

      setSearchResults([...categoryResults, ...productResults]);
    };

    const timeout = setTimeout(updateResults, 0);
    return () => clearTimeout(timeout);
  }, [searchTerm, categories, products]);

  return (
    <SearchContext.Provider value={{ products, categories, searchTerm, setSearchTerm, searchResults, fetchData }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};
