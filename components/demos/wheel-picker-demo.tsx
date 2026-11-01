"use client"

import * as React from "react"

import {
  WheelPicker,
  WheelPickerGroup,
} from "@/registry/default/wheel-picker/wheel-picker"

const hours = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}))

const minutes = Array.from({ length: 12 }, (_, index) => {
  const minute = String(index * 5).padStart(2, "0")
  return { value: minute, label: minute }
})

const periods = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
]

export function WheelPickerDemo() {
  const [hour, setHour] = React.useState("7")
  const [minute, setMinute] = React.useState("30")
  const [period, setPeriod] = React.useState("AM")

  return (
    <div className="bg-background border-border w-full max-w-[20rem] rounded-[1.25rem] border p-5 shadow-sm">
      <p className="text-sm font-medium">Daily reminder</p>
      <p className="text-muted-foreground mt-1 text-sm">
        We will nudge you at{" "}
        <span className="text-foreground font-medium tabular-nums">
          {hour}:{minute} {period}
        </span>
        .
      </p>

      <WheelPickerGroup className="mt-5" label="Reminder time">
        <WheelPicker
          label="Hour"
          loop
          onValueChange={setHour}
          options={hours}
          value={hour}
        />
        <WheelPicker
          label="Minute"
          loop
          onValueChange={setMinute}
          options={minutes}
          value={minute}
        />
        <WheelPicker
          label="AM or PM"
          onValueChange={setPeriod}
          options={periods}
          value={period}
        />
      </WheelPickerGroup>
    </div>
  )
}
