import { h } from 'preact';
import { useState } from 'preact/hooks';

type ActionButtonProps = {
  visible: boolean;
  top: number;
  left: number;
  iconUrl: string;
  tooltipText: string;
  onClick: () => void;
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
    width: '28px',
    height: '28px',
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
    width: '16px',
    height: '16px',
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
        onClick={props.onClick}
      >
        <img alt="" src={props.iconUrl} style={iconStyle} />
      </button>
      <Tooltip text={props.tooltipText} visible={isHover} />
    </div>
  );
}
