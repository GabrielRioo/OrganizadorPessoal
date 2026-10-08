import { useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export type CatalogOption = {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl: string | null;
};

type CatalogSuggestFieldProps<T extends CatalogOption> = {
  label: string;
  value: string;
  onInputChange: (value: string) => void;
  onSelect: (option: T) => void;
  search: (query: string) => Promise<{ available: boolean; results: T[] }>;
};

export function CatalogSuggestField<T extends CatalogOption>({
  label,
  value,
  onInputChange,
  onSelect,
  search,
}: CatalogSuggestFieldProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setOptions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setLoading(true);
      void search(query)
        .then((response) => {
          setAvailable(response.available);
          setOptions(
            response.results.map((item, index) => ({
              ...item,
              id: item.id || `${item.title}-${index}`,
            })),
          );
        })
        .catch(() => {
          setOptions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, value]);

  const helper = useMemo(() => {
    if (!available) {
      return "Sugestões desligadas: configure as chaves de API no servidor.";
    }
    return "Digite para ver capas e sugestões.";
  }, [available]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      filterOptions={(current) => current}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.title)}
      inputValue={value}
      onInputChange={(_event, next, reason) => {
        if (reason === "input" || reason === "clear") {
          onInputChange(next);
        }
      }}
      onChange={(_event, option) => {
        if (option && typeof option !== "string") {
          onSelect(option);
        }
      }}
      loading={loading}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id} sx={{ gap: 1.5 }}>
          <Avatar variant="rounded" src={option.coverUrl ?? undefined} alt="" />
          <Box>
            <Typography variant="body2">{option.title}</Typography>
            {option.subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {option.subtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} label={label} required fullWidth helperText={helper} sx={{ mt: 1 }} />
      )}
    />
  );
}
