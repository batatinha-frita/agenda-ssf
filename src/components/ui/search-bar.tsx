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
  showButton = false,
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
  };
  return (
    <div className={className}>
      <div className="relative">
        {isSearching && searchQuery ? (
          <Loader2 className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 animate-spin" />
        ) : (
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        )}
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          className="focus:border-primary bg-background/60 h-14 border-2 pl-12 text-base shadow-sm backdrop-blur-sm"
        />
      </div>
    </div>
  );
}
