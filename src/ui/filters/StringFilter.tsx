import { useCallback } from "react";
import { Button, Input, Space } from "antd";
import ClearIcon from "@mui/icons-material/Clear";
import { useFilterStyles } from "./filter.styles";

export type StringFilterProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeHolder?: string;
};

export const StringFilter = ({
  value,
  onChange,
  placeHolder = "Поиск",
}: StringFilterProps) => {
  const { styles } = useFilterStyles();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value.trim());
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <>
      <Input
        placeholder={placeHolder}
        value={value}
        onChange={handleInputChange}
        className={styles.searchInput}
      />
      <Space>
        <Button
          size="small"
          color="danger"
          variant="outlined"
          onClick={handleClear}
        >
          <ClearIcon /> Очистить
        </Button>
      </Space>
    </>
  );
};
