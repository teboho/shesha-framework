import { Button, Card } from 'antd';
import React, { FC } from 'react';
import { IConfigurableTheme, pickStyleFromModel, StyleBoxValue, useFormComponentStyles } from '@/index';
import { jsonSafeParse } from '@/utils/object';

interface LayoutExampleProps {
  theme?: IConfigurableTheme;
}

const LayoutExample: FC<LayoutExampleProps> = ({ theme }) => {
  const layoutStylingBoxParsed = jsonSafeParse<StyleBoxValue>(theme?.layoutComponents?.stylingBox || '{}');
  const layoutStylingBoxAsCSS = pickStyleFromModel(layoutStylingBoxParsed);
  const horizontalGap = theme?.layoutComponents?.gridGapHorizontal;
  const verticalGap = theme?.layoutComponents?.gridGapVertical;
  const { fullStyle } = useFormComponentStyles({ ...(theme?.layoutComponents ?? {}), jsStyle: '' });

  return (
    <Card styles={{ body: { ...layoutStylingBoxAsCSS, ...fullStyle } }} title="Card">
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
