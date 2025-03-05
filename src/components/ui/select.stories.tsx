import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a room to enter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="room1">Room 1</SelectItem>
        <SelectItem value="room2">Room 2</SelectItem>
        <SelectItem value="room3">Room 3</SelectItem>
      </SelectContent>
    </Select>
  ),
}; 