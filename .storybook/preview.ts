import type { Preview } from '@storybook/web-components';
// Load the design tokens so every story is themed correctly. Without this
// import components render unstyled — every colour and space is a token.
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'sand',
      values: [
        { name: 'sand', value: '#f4f1de' },
        { name: 'surface', value: '#ffffff' },
        { name: 'navy', value: '#003049' },
      ],
    },
    options: {
      storySort: {
        order: ['Design', ['Colors'], 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'],
      },
    },
  },
};

export default preview;
