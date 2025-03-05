import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const LoginCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Input your name"
              required
            />{" "}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Room</label>
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
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  ),
};

export const ChatCard: Story = {
  render: () => (
    <Card className="flex-1 overflow-y-auto md:p-4 py-4 h-[350px]">
      <CardContent>
        {[
          { from: "user", content: "Hey, how are you?" },
          { from: "John", content: "I'm good! How about you?" },
          { from: "user", content: "Doing great! Working on the new project." },
          { from: "John", content: "That sounds interesting! Need any help?" },
          { from: "user", content: "Hey, how are you?" },
          { from: "John", content: "I'm good! How about you?" },
          { from: "user", content: "Doing great! Working on the new project." },
          { from: "John", content: "That sounds interesting! Need any help?" },
        ].map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={cn(
                "p-3 rounded-md flex flex-col w-fit",
                msg.from === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {msg.from !== "user" && (
                <span className="font-bold">{msg.from}:</span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  ),
};
