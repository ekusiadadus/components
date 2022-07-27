// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

import { ButtonDropdownProps, InternalButtonDropdownProps } from '../../../lib/components/button-dropdown/interfaces';
import InternalButtonDropdown from '../../../lib/components/button-dropdown/internal';
import { ButtonDropdownWrapper, ElementWrapper } from '../../../lib/components/test-utils/dom';
import styles from '../../../lib/components/button-dropdown/styles.css.js';
import itemStyls from '../../../lib/components/button-dropdown/item-element/styles.css.js';
import { KeyCode } from '../../internal/keycode';

const items: ButtonDropdownProps.Items = [
  { id: 'i1', text: 'item1', description: 'Item 1 description' },
  {
    text: 'category1',
    items: [
      { id: 'i2', text: 'item2' },
      { id: 'i3', text: 'item3' },
    ],
  },
  { id: 'i4', text: 'item4' },
];

const renderInternalButtonDropdown = (props: InternalButtonDropdownProps) => {
  const { baseElement } = render(<InternalButtonDropdown {...props} />);
  return new ButtonDropdownWrapper(baseElement as HTMLElement);
};

function findHeader(wrapper: ButtonDropdownWrapper): ElementWrapper<HTMLElement> {
  return wrapper.findOpenDropdown()!.find(`.${styles.header}`)!;
}

describe('Button dropdown header', () => {
  it('is not visible by default', () => {
    const wrapper = renderInternalButtonDropdown({ items });

    wrapper.openDropdown();
    expect(findHeader(wrapper)).toBeFalsy();
  });

  it('renders a title', () => {
    const wrapper = renderInternalButtonDropdown({ items, title: 'Title' });

    wrapper.openDropdown();
    expect(findHeader(wrapper).getElement()).toHaveTextContent('Title');
  });

  it('renders a title and description', () => {
    const wrapper = renderInternalButtonDropdown({ items, title: 'Title', description: 'Description' });

    wrapper.openDropdown();
    expect(findHeader(wrapper).getElement()).toHaveTextContent('Title');
    expect(findHeader(wrapper).getElement()).toHaveTextContent('Description');
  });

  it('renders a description without a title', () => {
    const wrapper = renderInternalButtonDropdown({ items, description: 'Description' });

    wrapper.openDropdown();
    expect(findHeader(wrapper).getElement()).toHaveTextContent('Description');
  });
});

describe('Button dropdown navigate with mouse or keyboard', () => {
  it('should add class is-keyboard if highligted with keyboard and remove when using mouse', () => {
    const wrapper = renderInternalButtonDropdown({ items });
    wrapper.openDropdown();
    act(() => wrapper.findOpenDropdown()!.keydown(KeyCode.down));
    expect(wrapper.findHighlightedItem()!.getElement()).toHaveClass(itemStyls['is-keyboard']);

    fireEvent.mouseMove(wrapper.findItemById('i4')!.getElement());
    fireEvent.mouseEnter(wrapper.findItemById('i4')!.getElement());
    expect(wrapper.findHighlightedItem()!.getElement()).not.toHaveClass(itemStyls['is-keyboard']);
  });
});
