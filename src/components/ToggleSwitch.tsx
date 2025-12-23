import React from "react";
import "./ToggleSwitch.css";

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  value: "left" | "right";
  onChange: (value: "left" | "right") => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftLabel,
  rightLabel,
  value,
  onChange,
}) => {
  return (
    <div className="toggle-settings-row">
      <span
        className={`toggle-label ${value === "left" ? "active" : "inactive"}`}
        onClick={() => onChange("left")}>
        {leftLabel}
      </span>

      <div
        className={`toggle-switch-track ${value === "right" ? "active" : ""}`}
        onClick={() => onChange(value === "left" ? "right" : "left")}>
        <div className="toggle-thumb"></div>
      </div>

      <span
        className={`toggle-label text-right ${value === "right" ? "active" : "inactive"}`}
        onClick={() => onChange("right")}>
        {rightLabel}
      </span>
    </div>
  );
};
