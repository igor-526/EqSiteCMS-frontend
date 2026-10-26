import { useCallback, type Ref } from "react";
import { Button, Input, Space, type InputRef } from "antd";
import ClearIcon from "@mui/icons-material/Clear";
import { useFilterStyles } from "./filter.styles";

export type StringFilterProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeHolder?: string;
  trimOnChange?: boolean;
  inputAriaLabel?: string;
  inputRef?: Ref<InputRef>;
};

export const StringFilter = ({
  value,
  onChange,
  placeHolder = "Поиск",
  trimOnChange = true,
  inputAriaLabel,
  inputRef,
}: StringFilterProps) => {
  const { styles } = useFilterStyles();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(trimOnChange ? event.target.value.trim() : event.target.value);
    },
    [onChange, trimOnChange],
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <>
      <Input
        ref={inputRef}
        aria-label={inputAriaLabel}
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
