import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import type { ListLayout } from "../hooks/useListLayout";

type ListLayoutToggleProps = {
  value: ListLayout;
  onChange: (layout: ListLayout) => void;
};

export function ListLayoutToggle({ value, onChange }: ListLayoutToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_event, next: ListLayout | null) => {
        if (next) onChange(next);
      }}
      aria-label="Como exibir os itens"
    >
      <ToggleButton value="stack" aria-label="Lista">
        <ViewAgendaOutlinedIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="cards" aria-label="Grade">
        <GridViewOutlinedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
