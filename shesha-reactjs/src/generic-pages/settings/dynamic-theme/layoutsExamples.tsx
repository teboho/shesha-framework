import { Button, Card } from 'antd';
import React, { FC } from 'react';
import { IConfigurableTheme, useFormComponentStyles } from '@/index';

interface LayoutExampleProps {
  theme?: IConfigurableTheme;
}

const LayoutExample: FC<LayoutExampleProps> = ({ theme }) => {
  const horizontalGap = theme?.layoutComponents?.gridGapHorizontal;
  const verticalGap = theme?.layoutComponents?.gridGapVertical;
  const { fullStyle } = useFormComponentStyles({ ...(theme?.layoutComponents ?? {}), jsStyle: '' });
  const { paddingTop, paddingBottom, paddingLeft, paddingRight, ...rest } = fullStyle;
  const paddingStyle = { paddingTop, paddingRight, paddingLeft, paddingBottom };
  return (
    <Card styles={{ body: paddingStyle, header: paddingStyle }} style={{ ...rest }} title="Card">
      <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", rowGap: verticalGap, columnGap: horizontalGap }}>
        <Button>Item 1</Button>
        <Button>Item 2</Button>
        <Button>Item 3</Button>
        <Button>Item 4</Button>
      </div>
    </Card>
  );
};

export default LayoutExample;
