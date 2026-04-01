import type { Meta, StoryObj } from '@storybook/react';
import { TypeSourceViewer } from '../src/integrations/storybook/TypeSourceViewer';

const meta: Meta<typeof TypeSourceViewer> = {
  title: 'Examples/CSF Stories',
  component: TypeSourceViewer,
};

export default meta;

type Story = StoryObj<typeof TypeSourceViewer>;

export const Interface: Story = {
  name: 'Interface (ButtonProps)',
  args: {
    filePath: './stories/fixtures/sample-types.ts',
    typeName: 'ButtonProps',
  },
};

export const GenericType: Story = {
  name: 'Generic Type (TableColumn<T>)',
  args: {
    filePath: './stories/fixtures/sample-types.ts',
    typeName: 'TableColumn',
  },
};

export const IntersectionUnion: Story = {
  name: 'Discriminated Union (FormFieldConfig)',
  args: {
    filePath: './stories/fixtures/sample-types.ts',
    typeName: 'FormFieldConfig',
  },
};

export const UtilityType: Story = {
  name: 'Utility Type (ReadonlyButtonProps)',
  args: {
    filePath: './stories/fixtures/sample-types.ts',
    typeName: 'ReadonlyButtonProps',
  },
};

export const WithPreSource: Story = {
  name: 'With Custom Prefix',
  args: {
    filePath: './stories/fixtures/sample-types.ts',
    typeName: 'ButtonProps',
    preSource: '// Button component props\n',
  },
};
