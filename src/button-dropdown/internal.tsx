// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './styles.css.js';
import { ButtonDropdownProps, InternalButtonDropdownProps } from './interfaces';
import { getBaseProps } from '../internal/base-component';
import { useUniqueId } from '../internal/hooks/use-unique-id';
import Dropdown from '../internal/components/dropdown';
import ItemsList from './items-list';
import { useButtonDropdown } from './utils/use-button-dropdown';
import OptionsList from '../internal/components/options-list';
import { InternalButton } from '../button/internal';
import { ButtonProps } from '../button/interfaces';
import { useMobile } from '../internal/hooks/use-mobile';
import useForwardFocus from '../internal/hooks/forward-focus';
import { usePrevious } from '../internal/hooks/use-previous';
import InternalBox from '../box/internal';
import { checkSafeUrl } from '../internal/utils/check-safe-url';

const InternalButtonDropdown = React.forwardRef(
  (
    {
      items,
      variant = 'normal',
      loading = false,
      disabled = false,
      expandableGroups = false,
      children,
      onItemClick,
      onItemFollow,
      customTriggerBuilder,
      expandToViewport,
      ariaLabel,
      title,
      description,
      preferCenter,
      __internalRootRef,
      ...props
    }: InternalButtonDropdownProps,
    ref: React.Ref<ButtonDropdownProps.Ref>
  ) => {
    const isInRestrictedView = useMobile();
    const usingMouse = useRef(true);
    const dropdownId = useUniqueId('dropdown');
    for (const item of items) {
      checkSafeUrl('ButtonDropdown', item.href);
    }

    const {
      isOpen,
      targetItem,
      isHighlighted,
      isExpanded,
      highlightItem,
      onKeyDown,
      onKeyUp,
      onItemActivate,
      onGroupToggle,
      toggleDropdown,
    } = useButtonDropdown({
      items,
      onItemClick,
      onItemFollow,
      hasExpandableGroups: expandableGroups,
      isInRestrictedView,
      usingMouse,
    });

    const handleMouseEvent = () => {
      usingMouse.current = true;
    };

    const baseProps = getBaseProps(props);

    const dropdownRef = useRef<HTMLElement>(null);
    useForwardFocus(ref, dropdownRef);

    const clickHandler = () => {
      if (!usingMouse.current) {
        return;
      }
      if (!loading && !disabled) {
        toggleDropdown();
        if (dropdownRef.current) {
          dropdownRef.current.focus();
        }
      }
    };

    const canBeOpened = !loading && !disabled;
    const wasOpen = usePrevious(isOpen);

    useEffect(() => {
      if (!isOpen && dropdownRef.current && wasOpen) {
        dropdownRef.current.focus();
      }
    }, [isOpen, wasOpen]);

    const triggerVariant = variant === 'navigation' ? undefined : variant;
    const iconProps: Partial<ButtonProps & { __iconClass?: string }> =
      variant === 'icon'
        ? {
            iconName: 'ellipsis',
          }
        : {
            iconName: 'caret-down-filled',
            iconAlign: 'right',
            __iconClass: canBeOpened && isOpen ? styles['rotate-up'] : styles['rotate-down'],
          };

    const trigger = customTriggerBuilder ? (
      customTriggerBuilder(clickHandler, dropdownRef, disabled, isOpen)
    ) : (
      <InternalButton
        ref={dropdownRef}
        {...iconProps}
        variant={triggerVariant}
        loading={loading}
        disabled={disabled}
        onClick={(event: Event) => {
          event.preventDefault();
          clickHandler();
        }}
        ariaLabel={ariaLabel}
        aria-haspopup={true}
        ariaExpanded={canBeOpened && isOpen}
        formAction="none"
      >
        {children}
      </InternalButton>
    );

    const hasHeader = title || description;
    const headerId = useUniqueId('awsui-button-dropdown__header');

    return (
      <div
        {...baseProps}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onMouseDown={handleMouseEvent}
        className={clsx(styles['button-dropdown'], styles[`variant-${variant}`], baseProps.className)}
        aria-owns={expandToViewport && isOpen ? dropdownId : undefined}
        ref={__internalRootRef}
      >
        <Dropdown
          open={canBeOpened && isOpen}
          stretchWidth={false}
          stretchTriggerHeight={variant === 'navigation'}
          expandToViewport={expandToViewport}
          preferCenter={preferCenter}
          onDropdownClose={() => {
            toggleDropdown();
          }}
          trigger={trigger}
          dropdownId={dropdownId}
        >
          {hasHeader && (
            <div className={styles.header} id={headerId}>
              {title && (
                <InternalBox fontSize="heading-s" fontWeight="bold">
                  <span className={styles.title}>{title}</span>
                </InternalBox>
              )}
              {description && (
                <InternalBox fontSize="body-s">
                  <span className={styles.description}>{description}</span>
                </InternalBox>
              )}
            </div>
          )}
          <OptionsList
            open={canBeOpened && isOpen}
            position="static"
            role="menu"
            decreaseTopMargin={true}
            ariaLabelledby={hasHeader ? headerId : undefined}
          >
            <ItemsList
              items={items}
              onItemActivate={onItemActivate}
              onGroupToggle={onGroupToggle}
              hasExpandableGroups={expandableGroups}
              targetItem={targetItem}
              isHighlighted={isHighlighted}
              isExpanded={isExpanded}
              highlightItem={highlightItem}
              expandToViewport={expandToViewport}
              variant={variant}
            />
          </OptionsList>
        </Dropdown>
      </div>
    );
  }
);

export default InternalButtonDropdown;
