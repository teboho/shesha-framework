import React from 'react';
import { Story, Meta } from '@storybook/react';
import { addStory } from 'stories/utils';
import StoryApp from 'components/storyBookApp';
import DesignerPage, { IDesignerPageProps } from 'pages/forms-designer';

export default {
  title: 'Components/Basic/Alert',
} as Meta;

//#region Default
// Create a master template for mapping args to render the Button component
const Template: Story<IDesignerPageProps> = (args) => (
  <StoryApp>
    <DesignerPage {...args} />
  </StoryApp>
);

export const Playground = addStory(Template, {
  formId: ' 3c67b029-9c58-4a18-8af5-7f7d8ffaddc0',
});

//export const Basic = Template.bind({});
//#endregion
