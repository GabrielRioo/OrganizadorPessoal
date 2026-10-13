import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";

type ListPaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export function ListPagination({ page, pageCount, onChange }: ListPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
      <Pagination
        page={page}
        count={pageCount}
        color="primary"
        shape="rounded"
        onChange={(_event, value) => onChange(value)}
      />
    </Box>
  );
}
