import { useTheme } from "@/providers"
import { Button, Space, Typography } from "antd"
import React, { FC } from "react"

export const InlineComponentsExample: FC = () => {
    const { theme } = useTheme();

    return (
        <Space direction="vertical">
            <Space direction="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", rowGap: 8, columnGap: 8}}>
                    <Button type="primary">Primary Button</Button>
                    <Button danger >Error Button</Button>
                    <Button type="link">Secondary Button</Button>
                    <Button type="default">Default Button</Button>
                </div>
            </Space>
            <Space direction="vertical">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Typography.Text style={{ color: theme?.text?.default }}>
                        Default text
                    </Typography.Text>

                    <Typography.Text type="secondary" style={{ color: theme?.text?.secondary }}>
                        Secondary text
                    </Typography.Text>

                    <Typography.Link style={{ color: theme?.text?.link }}>Link text</Typography.Link>
                </Space>
            </Space>
        </Space>
    )
}