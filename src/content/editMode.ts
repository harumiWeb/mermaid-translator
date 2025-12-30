type EditModeElements = {
  root: HTMLElement;
  arrow: HTMLElement;
  header: HTMLElement;
  resizeHandle: HTMLElement;
  tabBar: HTMLElement;
  viewTab: HTMLButtonElement;
  editorTab: HTMLButtonElement;
  content: HTMLElement;
  editorPanel: HTMLElement;
  editorTextarea: HTMLTextAreaElement;
  message: HTMLElement | null;
};

type EditModeConfig = {
  popupEditWidth: string;
  popupEditMaxHeight: string;
  popupEditContentMaxHeight: string;
  popupDefaultMaxHeight: number;
  popupMaxWidth: string;
  popupInitialContentHeight: number;
};

type EditModeController = {
  setElements: (elements: EditModeElements | null) => void;
  setEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: 'view' | 'editor') => void;
  updateTheme: (theme: 'light' | 'dark') => void;
  updateLayout: () => void;
  isEnabled: () => boolean;
  getActiveTab: () => 'view' | 'editor';
};

export function createEditModeController(
  config: EditModeConfig,
  onViewRequested: () => void
): EditModeController {
  let elements: EditModeElements | null = null;
  let enabled = false;
  let activeTab: 'view' | 'editor' = 'view';

  const applyTabStyle = (
    button: HTMLButtonElement,
    isActive: boolean,
    theme: 'light' | 'dark'
  ) => {
    const isDark = theme === 'dark';
    const borderColor = isDark ? '#3a3a3a' : '#222';
    const activeBackground = isDark ? '#2a2a2a' : '#fff';
    const inactiveBackground = isDark ? '#242424' : '#f2f2f2';
    const activeColor = isDark ? '#f2f2f2' : '#111';
    const inactiveColor = isDark ? '#cfcfcf' : '#333';

    button.style.height = '28px';
    button.style.flex = '1';
    button.style.border = `1px solid ${borderColor}`;
    button.style.borderRadius = '6px';
    button.style.background = isActive ? activeBackground : inactiveBackground;
    button.style.color = isActive ? activeColor : inactiveColor;
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
  };

  return {
    setElements(next) {
      elements = next;
    },
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
      if (!elements) {
        return;
      }

      if (enabled) {
        elements.root.style.width = config.popupEditWidth;
        elements.root.style.maxWidth = 'none';
        elements.root.style.maxHeight = config.popupEditMaxHeight;
        elements.content.style.maxHeight = config.popupEditContentMaxHeight;
        elements.root.style.height = '';
        elements.arrow.style.display = 'none';
        elements.header.style.cursor = 'move';
        elements.resizeHandle.style.display = 'block';

        const headerHeight = elements.header.getBoundingClientRect().height;
        const tabHeight = elements.tabBar.getBoundingClientRect().height;
        const messageHeight = elements.message
          ? elements.message.getBoundingClientRect().height
          : 0;
        const totalHeight =
          config.popupInitialContentHeight +
          headerHeight +
          tabHeight +
          messageHeight +
          48;
        elements.root.style.height = `${Math.floor(totalHeight)}px`;

        const rect = elements.root.getBoundingClientRect();
        const centeredTop = Math.max(8, (window.innerHeight - rect.height) / 2);
        const centeredLeft = Math.max(8, (window.innerWidth - rect.width) / 2);
        elements.root.style.top = `${Math.floor(centeredTop)}px`;
        elements.root.style.left = `${Math.floor(centeredLeft)}px`;
      } else {
        elements.root.style.width = '';
        elements.root.style.maxWidth = config.popupMaxWidth;
        elements.root.style.maxHeight = '';
        elements.root.style.height = '';
        elements.content.style.maxHeight = `${config.popupDefaultMaxHeight}px`;
        elements.arrow.style.display = '';
        elements.header.style.cursor = 'default';
        elements.resizeHandle.style.display = 'none';
      }

      elements.tabBar.style.display = enabled ? 'flex' : 'none';
      elements.tabBar.style.gap = '6px';
      elements.tabBar.style.marginTop = '8px';

      this.updateLayout();
    },
    setActiveTab(tab) {
      activeTab = tab;
      if (!elements) {
        return;
      }

      elements.content.style.display = tab === 'view' ? 'block' : 'none';
      elements.editorPanel.style.display = tab === 'editor' ? 'block' : 'none';

      if (enabled && tab === 'view') {
        onViewRequested();
      }
    },
    updateTheme(theme) {
      if (!elements) {
        return;
      }

      applyTabStyle(elements.viewTab, activeTab === 'view', theme);
      applyTabStyle(elements.editorTab, activeTab === 'editor', theme);

      const isDark = theme === 'dark';
      const borderColor = isDark ? '#3a3a3a' : '#222';
      elements.editorTextarea.style.border = `1px solid ${borderColor}`;
      elements.editorTextarea.style.background = isDark ? '#151515' : '#fff';
      elements.editorTextarea.style.color = isDark ? '#f2f2f2' : '#111';
    },
    updateLayout() {
      if (!elements) {
        return;
      }

      const rect = elements.root.getBoundingClientRect();
      const headerHeight = elements.header.getBoundingClientRect().height;
      const tabHeight = elements.tabBar.getBoundingClientRect().height;
      const messageHeight = elements.message
        ? elements.message.getBoundingClientRect().height
        : 0;
      const available = Math.max(
        200,
        rect.height - headerHeight - tabHeight - messageHeight - 48
      );

      const availablePx = `${Math.floor(available)}px`;
      elements.content.style.height = availablePx;
      elements.content.style.maxHeight = availablePx;
      elements.editorTextarea.style.height = availablePx;
    },
    isEnabled() {
      return enabled;
    },
    getActiveTab() {
      return activeTab;
    },
  };
}
