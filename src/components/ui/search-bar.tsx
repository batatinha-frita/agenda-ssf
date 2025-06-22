"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showButton?: boolean;
}

export function SearchBar({ 
  placeholder = "Pesquisar...", 
  onSearch,
  className = "",
  showButton = false
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pesquisa em tempo real com debounce
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      onSearch?.(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };  return (
    <div className={className}>
      <div className="relative">
        {isSearching && searchQuery ? (
          <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          className="pl-12 h-14 text-base border-2 focus:border-primary bg-background/60 backdrop-blur-sm shadow-sm"
        />
      </div>
    </div>
  );
}
