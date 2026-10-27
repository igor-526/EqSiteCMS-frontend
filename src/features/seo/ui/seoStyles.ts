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
  tabHeader: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    .ant-tabs-tab + .ant-tabs-tab { margin-left: 16px; }

    > .ant-tabs-nav {
      flex: 1 0 420px;
      min-width: 0;
      max-width: 100%;
      margin-bottom: 0;
    }
  `,
  pagesTabs: css`
    height: 100%;
    min-height: 0;
    > .ant-tabs-content-holder { flex: 1; min-height: 0; }
    > .ant-tabs-content-holder > .ant-tabs-content,
    > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane { height: 100%; }
  `,
  pagesDataPanel: css`
    && { height: 100%; min-height: 0; }
  `,
  pagesReset: css`
    &&:not(:disabled) {
      color: #a61d24;
      border-color: #a61d24;
      background-color: #ffffff;
      &:hover, &:focus-visible, &:active {
        color: #820014;
        border-color: #820014;
        background-color: #ffffff;
      }
    }
  `,
  refreshConfirm: css`
    /* Scoped to parse refresh: retain the shared unlink danger palette and focus outline. */
    &&:not(:disabled) {
      color: #ffffff;
      background-color: #0958d9;
      border-color: #0958d9;
      &:hover, &:focus-visible, &:active {
        color: #ffffff;
        background-color: #003eb3;
        border-color: #003eb3;
      }
    }
  `,
  pagesActions: css`
    display: flex;
    flex-wrap: wrap;
    max-width: 100%;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  `,
  metricsFilters: css`
    display: flex;
    align-items: end;
    gap: 12px;
    > label { display: flex; flex-direction: column; gap: 4px; }
  `,
  dateRange: css`display: flex; flex-direction: column; gap: 4px;`,
  srOnly: css`position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap;`,
  modeSelect: css`width: 150px;`,
  metricSelect: css`width: 225px;`,
  pageValue: css`
    display: block;
    width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  normalizationInput: css`
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  `,
  normalizationList: css`
    margin-top: 12px;
    min-height: 100px;
    max-height: 410px;
    overflow-y: auto;
  `,
  normalizationRow: css`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 30px;
    border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
    > button { flex: 0 0 auto; }
  `,
  normalizationValue: css`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  normalizationConfirm: css`
    max-width: 440px;
    max-height: 160px;
    overflow: auto;
    overflow-wrap: anywhere;
  `,
  dataPanel: css`
    min-width: 0;
    height: calc(100vh - 220px);
    min-height: 380px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    > div:last-child {
      min-height: 0;
      flex: 1;
    }
  `,
  dataPagination: css`
    flex: 0 0 auto;
  `,
  dataValue: css`
    display: block;
    width: min(55vw, 760px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  dataDate: css`
    white-space: nowrap;
  `,
  dataFilter: css`
    padding: 8px;
    width: 280px;

    /* Local SEO palette: shared danger defaults fail small-text contrast.
       Keep white behind every interactive state and retain AntD focus outline. */
    && .ant-btn-color-dangerous.ant-btn-variant-outlined:not(:disabled) {
      color: #a61d24;
      border-color: #a61d24;
      background-color: #ffffff;

      &:hover,
      &:focus-visible,
      &:active {
        color: #820014;
        border-color: #820014;
        background-color: #ffffff;
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
