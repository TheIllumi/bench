/**
 * Renders a consistent, minimal empty state view inside a container.
 * 
 * @param {HTMLElement} container - DOM element to render into
 * @param {string} title - Reassuring primary text
 * @param {string} description - Brief supporting explanation
 * @param {string} iconSvg - Inline SVG markup for the icon
 */
export function renderEmptyState(container, title, description, iconSvg) {
  container.innerHTML = `
    <div class="placeholder-view">
      ${iconSvg}
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
  `;
}
