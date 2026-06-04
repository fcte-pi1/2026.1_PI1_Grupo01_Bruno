import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { Badge } from './Badge';

type StoryProps = ComponentProps<typeof Badge>;

const meta : Meta<StoryProps> = {
    component: Badge,
    title: 'Badge',
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<StoryProps>;

export const Alert: Story = {
    args: {
        type: 'alert'
    }
};

export const Default: Story = {
    args: {
        type: 'default'
    }
};
export const Success: Story = {
    args: {
        type: 'success'
    }
};
export const Warn: Story = {
    args: {
        type: 'warn'
    }
};