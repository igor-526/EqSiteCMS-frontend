import { createStyles } from "antd-style";

export const useSeoStyles = createStyles(({ css }) => ({
  tabs: css`
    min-width: 0;

    && .ant-tabs-nav-operations {
      display: none;
    }

    && .ant-tabs-nav-list {
      width: 100%;
      transform: none !important;
    }

    && .ant-tabs-tab {
      flex: 0 1 auto;
      min-width: 0;
    }

    && .ant-tabs-tab-btn {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    @media (max-width: 576px) {
      && .ant-tabs-tab {
        flex: 1 1 0;
        justify-content: center;
        margin: 0;
        padding-inline: 4px;
      }
    }
  `,
  stepContent: css`
    min-width: 0;
    width: 100%;
  `,
  compactList: css`
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    min-width: 0;
  `,
  compactRow: css`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  `,
  rowAction: css`
    && {
      flex: 1;
      min-width: 0;
      height: auto;
      min-height: 44px;
      padding: 8px;
      justify-content: flex-start;
      text-align: start;
      white-space: normal;
    }

    && > span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  `,
  rowDetails: css`
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-wrap: anywhere;
  `,
  unlinkAction: css`
    && {
      flex: 0 0 44px;
      width: 44px;
      min-height: 44px;
    }
  `,
  connectionCard: css`
    min-width: 0;

    && .ant-card-head-title,
    && .ant-descriptions-title {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    && .ant-space,
    && .ant-space-item {
      min-width: 0;
      max-width: 100%;
    }

    && .ant-descriptions-item-content {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  `,
  counterPagination: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    &.ant-pagination .ant-pagination-options {
      display: inline-block;
      margin-inline-start: 0;
    }
  `,
}));
