import { nanoid } from '@/utils/uuid';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';

/**
 * A tooltip component that displays a tooltip for a given component
 * @param tooltip - The tooltip text to display
 * @param children - The component to display the tooltip for
 * @returns a component that displays a tooltip for a given component
 */
const MenuTooltip = ({ tooltip, children }: { children: React.ReactNode; tooltip: string }) => {
  return (
    <Tooltip title={tooltip} placement="right" key={"tooltip_" + nanoid()} color="white">
      <span>{children}</span>{" "}
      <QuestionCircleOutlined size={12} />
    </Tooltip>
  );
};

export default MenuTooltip;
