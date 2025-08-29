import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSearch: (coordinates: [number, number]) => void;
}

const SearchBar = ({ onSearch, onLocationSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSearch([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por cidade, estado ou CEP..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6">
          Buscar
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          onClick={handleLocationSearch}
          className="h-12 px-4"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;