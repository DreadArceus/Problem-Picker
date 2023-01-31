import React from "react";

interface TagProps {
  value: string;
  removeTag: () => void;
}

export const Tag: React.FC<TagProps> = ({ value, removeTag }) => {
  return (
    <div>
      <span onClick={removeTag}>X</span>
      <div>{value}</div>
    </div>
  );
};
