import { useEffect } from 'react';

function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isCmd = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      shortcuts.forEach(({ keys, callback, preventDefault = true }) => {
        const [modifier, ...keyParts] = keys.split('+').map(k => k.toLowerCase());
        const targetKey = keyParts.join('');

        if (modifier === 'cmd' && isCmd && key === targetKey) {
          if (preventDefault) event.preventDefault();
          callback(event);
        } else if (modifier === 'shift' && isShift && key === targetKey) {
          if (preventDefault) event.preventDefault();
          callback(event);
        } else if (!keyParts.length && key === modifier) {
          if (preventDefault) event.preventDefault();
          callback(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;