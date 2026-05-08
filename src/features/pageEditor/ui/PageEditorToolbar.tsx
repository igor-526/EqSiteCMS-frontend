"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { Button, Space } from "antd";
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    LinkOutlined,
    TableOutlined,
} from "@ant-design/icons";

interface PageEditorToolbarProps {
    editor: Editor | null;
}

export const PageEditorToolbar: React.FC<PageEditorToolbarProps> = ({ editor }) => {
    if (!editor) return null;

    const handleToggleLink = () => {
        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
        } else {
            const url = window.prompt("Введите URL ссылки:");
            if (url) {
                editor.chain().focus().setLink({ href: url }).run();
            }
        }
    };

    const handleInsertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        editor.chain().focus().setColor(e.target.value).run();
    };

    return (
        <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Space wrap size={4}>
                <Button
                    size="small"
                    type={editor.isActive("bold") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Жирный"
                >
                    <BoldOutlined />
                </Button>
                <Button
                    size="small"
                    type={editor.isActive("italic") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Курсив"
                >
                    <ItalicOutlined />
                </Button>
                <Button
                    size="small"
                    type={editor.isActive("underline") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Подчёркнутый"
                >
                    <UnderlineOutlined />
                </Button>

                <Button
                    size="small"
                    type={editor.isActive("heading", { level: 1 }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    title="Заголовок 1"
                >
                    H1
                </Button>
                <Button
                    size="small"
                    type={editor.isActive("heading", { level: 2 }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="Заголовок 2"
                >
                    H2
                </Button>
                <Button
                    size="small"
                    type={editor.isActive("heading", { level: 3 }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="Заголовок 3"
                >
                    H3
                </Button>

                <Button
                    size="small"
                    type={editor.isActive("bulletList") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Маркированный список"
                >
                    <UnorderedListOutlined />
                </Button>
                <Button
                    size="small"
                    type={editor.isActive("orderedList") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Нумерованный список"
                >
                    <OrderedListOutlined />
                </Button>

                <Button
                    size="small"
                    type={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    title="По левому краю"
                >
                    <AlignLeftOutlined />
                </Button>
                <Button
                    size="small"
                    type={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    title="По центру"
                >
                    <AlignCenterOutlined />
                </Button>
                <Button
                    size="small"
                    type={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    title="По правому краю"
                >
                    <AlignRightOutlined />
                </Button>

                <Button
                    size="small"
                    type={editor.isActive("link") ? "primary" : "default"}
                    onClick={handleToggleLink}
                    title="Ссылка"
                >
                    <LinkOutlined />
                </Button>

                <span title="Цвет текста" style={{ display: "inline-flex", alignItems: "center" }}>
                    <input
                        type="color"
                        onChange={handleColorChange}
                        style={{ width: 28, height: 28, padding: 0, border: "1px solid #d9d9d9", borderRadius: 4, cursor: "pointer" }}
                        title="Цвет текста"
                    />
                </span>

                <Button
                    size="small"
                    onClick={handleInsertTable}
                    title="Вставить таблицу 3x3"
                >
                    <TableOutlined />
                </Button>
            </Space>
        </div>
    );
};
