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

export function Tooltip(props: TooltipProps) {
  const tooltipStyle = {
    position: 'absolute',
    bottom: '36px',
    left: '50%',
    transform: props.visible ? 'translate(-50%, 0)' : 'translate(-50%, 4px)',
    opacity: props.visible ? 1 : 0,
    transition: 'opacity 140ms ease, transform 140ms ease',
    padding: '6px 8px',
    borderRadius: '6px',
    background: '#111',
    color: '#fff',
    fontSize: '12px',
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: '2147483647',
  } as const;

  const arrowStyle = {
    position: 'absolute',
    bottom: '-4px',
    left: '50%',
    width: '8px',
    height: '8px',
    transform: 'translateX(-50%) rotate(45deg)',
    background: '#111',
  } as const;

  return (
    <div aria-hidden={!props.visible} style={tooltipStyle}>
      {props.text}
      <span style={arrowStyle} />
    </div>
  );
}

type TooltipButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ComponentChildren;
  variant?: 'standard' | 'icon';
  theme: 'light' | 'dark';
};

function TooltipButton(props: TooltipButtonProps) {
  const [isHover, setIsHover] = useState(false);
  const isDisabled = props.disabled ?? false;
  const variant = props.variant ?? 'standard';
  const isDark = props.theme === 'dark';

  const wrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  const buttonStyle = {
    height: '28px',
    border: `1px solid ${isDark ? '#3a3a3a' : '#222'}`,
    borderRadius: '6px',
    background: isDark ? '#2a2a2a' : '#fff',
    color: isDark ? '#f2f2f2' : '#111',
    fontSize: '12px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    padding: variant === 'icon' ? '0 6px' : '0 8px',
    opacity: isDisabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  } as const;

  return (
    <div
      style={wrapperStyle}
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
        style={buttonStyle}
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

export function ActionButton(props: ActionButtonProps) {
  const [isHover, setIsHover] = useState(false);

  if (!props.visible) {
    return null;
  }

  const wrapperStyle = {
    position: 'fixed',
    top: `${props.top}px`,
    left: `${props.left}px`,
    zIndex: '2147483647',
  } as const;

  const style = {
    width: '35px',
    height: '35px',
    borderRadius: '6px',
    border: '1px solid #222',
    background: '#fff',
    color: '#111',
    fontSize: '12px',
    lineHeight: '26px',
    textAlign: 'center',
    padding: '0',
    cursor: 'pointer',
    userSelect: 'none',
    zIndex: '2147483647',
  } as const;

  const iconStyle = {
    display: 'block',
    width: '22px',
    height: '22px',
    margin: '0 auto',
  } as const;

  return (
    <div
      style={wrapperStyle}
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
        style={style}
        onPointerDown={(event) => {
          event.preventDefault();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={props.onClick}
      >
        <img alt="" src={props.iconUrl} style={iconStyle} />
      </button>
      <Tooltip text={props.tooltipText} visible={isHover} />
    </div>
  );
}

export function PopupActions(props: PopupActionsProps) {
  const [isThemeHover, setIsThemeHover] = useState(false);
  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  } as const;

  const groupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as const;

  const isDark = props.popupTheme === 'dark';
  const iconFilter = isDark ? 'invert(1)' : 'none';
  const iconStyle = {
    display: 'block',
    width: '14px',
    height: '14px',
    filter: iconFilter,
  } as const;

  const appIconStyle = {
    display: 'block',
    width: '18px',
    height: '18px',
  } as const;

  const closeStyle = {
    display: 'block',
    width: '14px',
    height: '14px',
    filter: iconFilter,
  } as const;

  const themeIconStyle = {
    display: 'block',
    width: '14px',
    height: '14px',
    filter: iconFilter,
  } as const;

  const themeGroupStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  } as const;

  const selectStyle = {
    height: '28px',
    border: `1px solid ${isDark ? '#3a3a3a' : '#222'}`,
    borderRadius: '6px',
    background: isDark ? '#2a2a2a' : '#fff',
    color: isDark ? '#f2f2f2' : '#111',
    fontSize: '12px',
    padding: '0 8px',
  } as const;

  return (
    <div style={barStyle}>
      <div style={groupStyle}>
        <img alt="" src={props.appIconUrl} style={appIconStyle} />
        <TooltipButton
          label="Save as SVG"
          disabled={!props.svgEnabled}
          onClick={props.onSvg}
          theme={props.popupTheme}
        >
          <span>SVG</span>
        </TooltipButton>
        <TooltipButton
          label="Save as PNG"
          disabled={!props.pngEnabled}
          onClick={props.onPng}
          theme={props.popupTheme}
        >
          <span>PNG</span>
        </TooltipButton>
        <TooltipButton
          label="Open in new tab"
          disabled={!props.openEnabled}
          onClick={props.onOpen}
          variant="icon"
          theme={props.popupTheme}
        >
          <img alt="" src={props.openIconUrl} style={iconStyle} />
        </TooltipButton>
        <TooltipButton
          label="Edit"
          disabled={!props.editEnabled}
          onClick={props.onEdit}
          variant="icon"
          theme={props.popupTheme}
        >
          <img alt="" src={props.editIconUrl} style={iconStyle} />
        </TooltipButton>
      </div>
      <div style={groupStyle}>
        <div style={themeGroupStyle}>
          <TooltipButton
            label="Toggle popup theme"
            onClick={props.onTogglePopupTheme}
            variant="icon"
            theme={props.popupTheme}
          >
            <img
              alt=""
              src={
                props.popupTheme === 'dark'
                  ? props.sunIconUrl
                  : props.moonIconUrl
              }
              style={themeIconStyle}
            />
          </TooltipButton>
          <div
            style={{ position: 'relative', display: 'inline-flex' }}
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
              style={selectStyle}
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
        <TooltipButton
          label="Close"
          onClick={props.onClose}
          variant="icon"
          theme={props.popupTheme}
        >
          <img alt="" src={props.closeIconUrl} style={closeStyle} />
        </TooltipButton>
      </div>
    </div>
  );
}
