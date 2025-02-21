// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// We use resolvedOptions to detect browser locale. This method allows us to override the value for testing.
export default function setResolvedOptions(newValue: { locale: string }): void {
  // eslint-disable-next-line no-undef
  window.Intl.DateTimeFormat.prototype.resolvedOptions = () => newValue;
}
