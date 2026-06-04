import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { fn } from 'storybook/test';

import { BottomBar } from './BottomBar';

type StoryProps = ComponentProps<typeof BottomBar>;

const meta : Meta<StoryProps> = {
    component: BottomBar,
    title: 'BottomBar',
    tags: ['autodocs'],
    args: {
        onPageChange: fn()
    }
};

export default meta;

type Story = StoryObj<StoryProps>;

export const Dashboard: Story = {
    args: {
        currentPage: 'dashboard'
    }
};

export const Historico: Story = {
    args: {
        currentPage: "historico"
    }
};

export const Projeto: Story = {
    args: {
        currentPage: "projeto"
    }
};

export const Equipe: Story = {
    args: {
        currentPage: "equipe"
    }
};

export const Chassi: Story = {
    args: {
        currentPage: "chassi"
    }
};


