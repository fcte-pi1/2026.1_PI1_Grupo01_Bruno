import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { Battery } from './Battery';

type StoryProps = ComponentProps<typeof Battery>;

const meta : Meta<StoryProps> = {
    component: Battery,
    title: 'Battery',
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<StoryProps>;

export const High: Story = {
    args: {
        level: 100,
    }
};

export const Medium: Story = {
    args: {
        level: 45,
    }
};

export const Low: Story = {
    args: {
        level: 15,
    }
};

export const Inactive: Story = {
    args: {
        level: 0,
    }
};
