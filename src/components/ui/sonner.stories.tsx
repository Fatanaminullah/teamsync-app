import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./sonner";
import { Button } from "./button";
import { toast } from "sonner";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Toast position on screen",
      defaultValue: "bottom-right",
    },
    richColors: {
      control: "boolean",
      description: "Enable rich colors for toasts",
      defaultValue: false,
    },
    closeButton: {
      control: "boolean",
      description: "Show close button on toasts",
      defaultValue: false,
    },
    duration: {
      control: { type: "number", min: 0, step: 1000 },
      description: "Auto dismiss time in milliseconds",
      defaultValue: 4000,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: ({ position, richColors, closeButton, duration }) => (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() =>
          toast("Default notification", {
            richColors,
            closeButton,
            duration,
          })
        }
      >
        Show Toast
      </Button>
      <Button
        variant="success"
        onClick={() =>
          toast.success("Success notification", {
            richColors,
            closeButton,
            duration,
          })
        }
      >
        Success Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.warning("Warning notification", {
            richColors,
            closeButton,
            duration,
          })
        }
      >
        Warning Toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast.error("Error notification", {
            richColors,
            closeButton,
            duration,
          })
        }
      >
        Error Toast
      </Button>
      <Toaster position={position} />
    </div>
  ),
};
