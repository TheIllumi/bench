import { createModal } from './modal.js';
import { createButton } from './button.js';

/**
 * DialogService coordinates modal confirmation boxes and alerts.
 */
export const DialogService = {
  /**
   * Shows a confirmation modal dialog.
   * 
   * @param {object} options
   * @param {string} options.title - Header title
   * @param {string} options.message - Confirmation text message
   * @param {string} [options.confirmText='Confirm'] - Label for confirm button
   * @param {string} [options.cancelText='Cancel'] - Label for cancel button
   * @param {'primary'|'danger'} [options.variant='primary'] - Variant style of confirm button
   * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled/dismissed
   */
  confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' }) {
    return new Promise((resolve) => {
      const bodyWrapper = document.createElement('div');

      const textMessage = document.createElement('p');
      textMessage.textContent = message;
      textMessage.style.marginBottom = '24px';
      textMessage.style.lineHeight = '1.5';
      bodyWrapper.appendChild(textMessage);

      const footer = document.createElement('div');
      footer.className = 'modal-footer-embedded';
      footer.style.display = 'flex';
      footer.style.justifyContent = 'flex-end';
      footer.style.gap = '8px';

      let modalRef = null;
      let hasResolved = false;

      const onConfirm = () => {
        hasResolved = true;
        resolve(true);
        if (modalRef) modalRef.close();
      };

      const onCancel = () => {
        hasResolved = true;
        resolve(false);
        if (modalRef) modalRef.close();
      };

      const cancelBtn = createButton({
        text: cancelText,
        onClick: onCancel,
        variant: 'secondary'
      });

      const confirmBtn = createButton({
        text: confirmText,
        onClick: onConfirm,
        variant: variant
      });

      footer.appendChild(cancelBtn);
      footer.appendChild(confirmBtn);
      bodyWrapper.appendChild(footer);

      modalRef = createModal({
        title,
        contentNode: bodyWrapper,
        onClose: () => {
          if (!hasResolved) {
            resolve(false);
          }
        }
      });
    });
  }
};
