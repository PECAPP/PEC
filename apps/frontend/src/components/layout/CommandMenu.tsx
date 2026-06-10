import { Button, Input, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@pec/ui";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CreditCard, MessageSquare, PlusCircle } from 'lucide-react';
import React from 'react';

type SearchableRoute = {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
};

export default function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState<SearchableRoute[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open || routes.length > 0) return;

    let cancelled = false;
    void import('@/utils/searchableRoutes').then((mod) => {
      if (!cancelled) {
        setRoutes(mod.searchableRoutes as SearchableRoute[]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, routes.length]);

  const filteredRoutes = useMemo(() => {
    const normalized = query.toLowerCase();
    return routes
      .filter(
        (route) =>
          route.title.toLowerCase().includes(normalized) ||
          route.keywords.some((keyword) => keyword.includes(normalized)),
      )
      .slice(0, 5);
  }, [query, routes]);

  return (
    <>
      <div className="relative" onClick={() => setOpen(true)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search... (Ctrl+K)"
          className="pl-10 bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 transition-colors focus-visible:ring-1 focus-visible:ring-primary cursor-pointer text-foreground placeholder:text-muted-foreground"
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search pages, students, or data..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-2 px-4 text-sm">
              No results found.
              <Button
                variant="link"
                className="px-1 h-auto font-normal text-primary"
                onClick={() => {
                  setOpen(false);
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                Search for &quot;{query}&quot;
              </Button>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Pages">
            {filteredRoutes.map((route) => (
              <CommandItem
                key={route.path}
                onSelect={() => {
                  setOpen(false);
                  router.push(route.path as any);
                }}
              >
                <route.icon className="mr-2 h-4 w-4" />
                <span>{route.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push('/finance');
              }}
            >
              <CreditCard className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Pay Exam / Semester Fee</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push('/chat');
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
              <span>Message an Instructor</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push('/dashboard');
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4 text-orange-500" />
              <span>Create Marketplace Listing</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search all for &quot;{query}&quot;</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
