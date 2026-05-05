import { Button, Input, Space } from "antd";
import ClearIcon from '@mui/icons-material/Clear';

export type StringFilterProps = {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    placeHolder?: string,
}

export const StringFilter = ({ value, onChange, placeHolder = "Поиск" }: StringFilterProps) => {
    return (
        <>
            <Input
                placeholder={placeHolder}
                value={value}
                onChange={(e) => onChange(e.target.value.trim())}
                style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
                <Button
                    size="small"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        onChange(undefined)
                    }}
                >
                    <ClearIcon /> Очистить
                </Button>
            </Space>
        </>
    );
};