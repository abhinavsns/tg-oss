/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

import React from "react";
import { Button, PopoverNext, Position } from "@blueprintjs/core";
import classnames from "classnames";
import popoverOverflowModifiers from "./utils/popoverOverflowModifiers";

function DropdownButton({
  disabled,
  menu,
  noRightIcon,
  popoverProps,
  className,
  ...rest
}) {
  return (
    <PopoverNext
      minimal
      middleware={popoverOverflowModifiers}
      disabled={disabled}
      autoFocus={false}
      content={menu}
      position={Position.BOTTOM_LEFT}
      {...popoverProps}
    >
      <Button
        disabled={disabled}
        className={classnames(className, "dropdown-button")}
        rightIcon={noRightIcon ? undefined : "caret-down"}
        {...rest}
      />
    </PopoverNext>
  );
}

export default DropdownButton;
