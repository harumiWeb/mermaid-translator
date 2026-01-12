import { h, type ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

type ActionButtonProps = {
  visible: boolean;
  top: number;
  left: number;
  iconUrl: string;
  tooltipText: string;
  onClick: () => void;
};

type PopupActionsProps = {
  svgEnabled: boolean;
  pngEnabled: boolean;
  openEnabled: boolean;
  editEnabled: boolean;
  themeOptions: ReadonlyArray<{ value: string; label: string }>;
  themeValue: string;
  popupTheme: 'light' | 'dark';
  onSvg: () => void;
  onPng: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onThemeChange: (value: string) => void;
  onTogglePopupTheme: () => void;
  onClose: () => void;
  openIconUrl: string;
  editIconUrl: string;
  closeIconUrl: string;
  sunIconUrl: string;
  moonIconUrl: string;
  appIconUrl: string;
};

type TooltipProps = {
  text: string;
  visible: boolean;
};

/**
 * Tooltip element used for hover hints within the popup UI.
 *
 * @param props - Tooltip display props.
 * @returns Tooltip element or null when hidden.
 */
export function Tooltip(props: TooltipProps) {
  const tooltipClass = props.visible ? 'mr-tooltip is-visible' : 'mr-tooltip';

  return (
    <div aria-hidden={!props.visible} className={tooltipClass}>
      {props.text}
      <span className="mr-tooltip-arrow" />
    </div>
  );
}

type TooltipButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ComponentChildren;
  variant?: 'standard' | 'icon';
};

function TooltipButton(props: TooltipButtonProps) {
  const [isHover, setIsHover] = useState(false);
  const isDisabled = props.disabled ?? false;
  const variant = props.variant ?? 'standard';
  const buttonClass = `mr-tooltip-button${
    variant === 'icon' ? ' is-icon' : ''
  }`;

  return (
    <div
      className="mr-tooltip-button-wrapper"
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      <button
        type="button"
        aria-label={props.label}
        className={buttonClass}
        disabled={isDisabled}
        onPointerDown={(event) => {
          event.preventDefault();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          if (isDisabled) {
            return;
          }
          props.onClick();
        }}
      >
        {props.children}
      </button>
      <Tooltip text={props.label} visible={isHover && !isDisabled} />
    </div>
  );
}

/**
 * Selection action button shown near the user's text selection.
 *
 * @param props - Action button display props.
 * @returns Action button element or null when not visible.
 */
export function ActionButton(props: ActionButtonProps) {
  const [isHover, setIsHover] = useState(false);

  if (!props.visible) {
    return null;
  }

  const wrapperStyle = {
    top: `${props.top}px`,
    left: `${props.left}px`,
  } as const;

  return (
    <div
      style={wrapperStyle}
      className="mr-action-wrapper"
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Render Mermaid"
        className="mr-action-button"
        onPointerDown={(event) => {
          event.preventDefault();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={props.onClick}
      >
        <img alt="" src={props.iconUrl} className="mr-action-icon" />
      </button>
      <Tooltip text={props.tooltipText} visible={isHover} />
    </div>
  );
}

/**
 * Popup action bar containing export, theme, and edit controls.
 *
 * @param props - Action handlers and UI state for the popup toolbar.
 * @returns Action bar element.
 */
export function PopupActions(props: PopupActionsProps) {
  const [isThemeHover, setIsThemeHover] = useState(false);

  return (
    <div className="mr-popup-actions-bar">
      <div className="mr-popup-actions-group">
        <img
          alt=""
          src={props.appIconUrl}
          className="mr-popup-actions-app-icon"
        />
        <TooltipButton
          label="Save as SVG"
          disabled={!props.svgEnabled}
          onClick={props.onSvg}
        >
          <span>SVG</span>
        </TooltipButton>
        <TooltipButton
          label="Save as PNG"
          disabled={!props.pngEnabled}
          onClick={props.onPng}
        >
          <span>PNG</span>
        </TooltipButton>
        <TooltipButton
          label="Open in new tab"
          disabled={!props.openEnabled}
          onClick={props.onOpen}
          variant="icon"
        >
          <img
            alt=""
            src={props.openIconUrl}
            className="mr-popup-actions-icon"
          />
        </TooltipButton>
        <TooltipButton
          label="Edit"
          disabled={!props.editEnabled}
          onClick={props.onEdit}
          variant="icon"
        >
          <img
            alt=""
            src={props.editIconUrl}
            className="mr-popup-actions-icon"
          />
        </TooltipButton>
      </div>
      <div className="mr-popup-actions-group">
        <div className="mr-popup-actions-theme-group">
          <TooltipButton
            label="Toggle popup theme"
            onClick={props.onTogglePopupTheme}
            variant="icon"
          >
            <img
              alt=""
              src={
                props.popupTheme === 'dark'
                  ? props.sunIconUrl
                  : props.moonIconUrl
              }
              className="mr-popup-actions-icon"
            />
          </TooltipButton>
          <div
            className="mr-theme-select-wrapper"
            onMouseEnter={() => {
              setIsThemeHover(true);
            }}
            onMouseLeave={() => {
              setIsThemeHover(false);
            }}
          >
            <select
              aria-label="Theme"
              value={props.themeValue}
              className="mr-popup-actions-select"
              onChange={(event) => {
                const target = event.currentTarget;
                props.onThemeChange(target.value);
              }}
            >
              {props.themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Tooltip text="Theme" visible={isThemeHover} />
          </div>
        </div>
        <TooltipButton label="Close" onClick={props.onClose} variant="icon">
          <img
            alt=""
            src={props.closeIconUrl}
            className="mr-popup-actions-icon"
          />
        </TooltipButton>
      </div>
    </div>
  );
}
