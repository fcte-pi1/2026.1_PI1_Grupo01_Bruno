import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { fn } from 'storybook/test';

import { Button } from './Button';

type StoryProps = ComponentProps<typeof Button>;

const meta : Meta<StoryProps> = {
    component: Button,
    title: 'Button',
    tags: ['autodocs'],
    args: {
        onClick: fn(),
        icon: '+'
    },
    argTypes: {
        hierarchy: {
            control: {
                type: 'radio'
            },
            options: ['primary', 'secondary', 'tertiary']
        },
        density: {
            control: {
                type: 'radio'
            },
            options: ['default', 'high', 'low']
        }
    }
};

export default meta;

type Story = StoryObj<StoryProps>;

export const Circle: Story = {
    args: {
        type: 'circle',
    }
};

export const Default: Story = {
    args: {
        type: 'default',
        label: 'teste'
    }
};