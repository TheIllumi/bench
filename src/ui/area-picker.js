import { Repository } from '../core/repository.js';

/**
 * Open floating Area picker dropdown next to active trigger element.
 * @param {Event} e - Click event
 * @param {object} item - Item that is being assigned
 * @param {Function} onSelect - Callback when an area is selected or cleared
 */
export function openAreaPicker(e, item, onSelect) {
  e.stopPropagation();

  // Remove existing dropdowns
  const existing = document.querySelector('.area-picker-dropdown');
  if (existing) existing.remove();

  const rect = e.target.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.className = 'area-picker-dropdown';
  
  // Align picker below the action button
  picker.style.top = `${rect.bottom + window.scrollY}px`;
  picker.style.left = `${rect.left + window.scrollX}px`;

  const areasList = Repository.getAreas().filter(a => !a.archived);

  if (areasList.length === 0) {
    const disabledItem = document.createElement('div');
    disabledItem.className = 'area-picker-item disabled';
    disabledItem.textContent = 'No Areas created';
    picker.appendChild(disabledItem);
  } else {
    // [None] selection to un-assign the area
    const noneItem = document.createElement('div');
    noneItem.className = 'area-picker-item';
    noneItem.textContent = '[None]';
    noneItem.addEventListener('click', () => {
      onSelect(null);
      picker.remove();
    });
    picker.appendChild(noneItem);

    areasList.forEach(area => {
      const el = document.createElement('div');
      el.className = 'area-picker-item';
      el.textContent = `[${area.name}]`;
      if (item.areaId === area.id) {
        el.classList.add('active');
      }
      el.addEventListener('click', () => {
        onSelect(area.id);
        picker.remove();
      });
      picker.appendChild(el);
    });
  }

  document.body.appendChild(picker);

  // Close dropdown on click outside
  const closePicker = (event) => {
    if (!picker.contains(event.target) && event.target !== e.target) {
      picker.remove();
      document.removeEventListener('mousedown', closePicker);
    }
  };
  document.addEventListener('mousedown', closePicker);
}
