"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Spin } from "antd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { usePageEditor } from "../hooks/usePageEditor";
import { PageEditorToolbar } from "./PageEditorToolbar";

type FetchResult = { status: "ok"; data: { page_data?: string | null } | null } | { status: "error"; data: { detail: string } };
type SaveResult = { status: "ok"; data: unknown } | { status: "error"; data: { detail: string } };

interface PageEditorModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    entityId: string | null;
    fetchPageData: (id: string) => Promise<FetchResult>;
    savePageData: (id: string, pageData: string) => Promise<SaveResult>;
    onSuccess?: () => void;
}

export const PageEditorModal: React.FC<PageEditorModalProps> = ({
    open,
    onClose,
    title,
    entityId,
    fetchPageData,
    savePageData,
    onSuccess,
}) => {
    const [clientError, setClientError] = useState<string | null>(null);

    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    const { initialHtml, loading, saving, error, save } = usePageEditor({
        entityId,
        open,
        fetchPageData,
        savePageData,
        onSuccess: handleSuccess,
    });

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content: "",
        editorProps: {
            attributes: {
                style: "outline: none;",
            },
        },
    });

    useEffect(() => {
        if (!open && editor) {
            editor.commands.clearContent();
            setClientError(null);
        }
    }, [open, editor]);

    useEffect(() => {
        if (editor && initialHtml !== undefined) {
            editor.commands.setContent(initialHtml);
        }
    }, [initialHtml, editor]);

    const handleSave = async () => {
        if (!editor) return;
        const html = editor.getHTML();
        const decoded = html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        if (/<script/i.test(decoded) || /javascript:/i.test(decoded) || /\bon\w+\s*=/i.test(decoded)) {
            setClientError("Содержимое не может включать JS-скрипты, javascript: ссылки или inline-обработчики событий.");
            return;
        }
        setClientError(null);
        await save(html);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={title}
            centered
            width={{
                xs: "95%",
                sm: "90%",
                md: "85%",
                lg: "80%",
                xl: "75%",
                xxl: "70%",
            }}
            footer={
                <Button
                    type="primary"
                    loading={saving}
                    onClick={handleSave}
                    disabled={loading}
                >
                    Сохранить
                </Button>
            }
            styles={{
                body: {
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
                    padding: "16px",
                },
            }}
        >
            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <PageEditorToolbar editor={editor} />
                    {clientError && (
                        <Alert
                            type="error"
                            message={clientError}
                            style={{ marginBottom: 8 }}
                            showIcon
                        />
                    )}
                    {error && (
                        <Alert
                            type="error"
                            message={error}
                            style={{ marginBottom: 8 }}
                            showIcon
                        />
                    )}
                    <div
                        style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            padding: 12,
                            minHeight: 400,
                            cursor: "text",
                            overflow: "auto",
                        }}
                        onClick={() => editor?.commands.focus()}
                    >
                        <EditorContent editor={editor} />
                    </div>
                </>
            )}
        </Modal>
    );
};
