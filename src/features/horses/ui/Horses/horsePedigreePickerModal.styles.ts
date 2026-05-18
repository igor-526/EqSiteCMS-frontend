import { createStyles } from "antd-style";

export const useHorsePedigreePickerModalStyles = createStyles(({ css, token }) => ({
    root: css`
        display: grid;
        gap: 12px;
    `,
    resultsPanel: css`
        min-height: 280px;
        max-height: 52vh;
        overflow-y: auto;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;
        padding: 8px;
    `,
    resultsList: css`
        display: grid;
        gap: 8px;
    `,
    paginationRow: css`
        justify-content: flex-end;
        width: 100%;
    `,
}));

export const useHorsePedigreeCandidateButtonStyles = createStyles(({ css, token }) => ({
    button: css`
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        width: 100%;
        min-height: 88px;
        padding: 10px;
        text-align: left;
        border-radius: ${token.borderRadius}px;
        cursor: pointer;
    `,
    buttonSelected: css`
        border: 1px solid ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
    `,
    buttonDefault: css`
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
    `,
    avatar: css`
        width: 56px;
        height: 56px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: ${token.colorTextSecondary};
    `,
    avatarEmpty: css`
        background: ${token.colorFillSecondary};
    `,
    details: css`
        min-width: 0;
    `,
    lineBlock: css`
        display: block;
    `,
}));
