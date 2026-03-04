/**
 * kern/src-js/behaviors/table-sort.js
 * Client-side column sorting for <th data-sort> columns.
 *
 * Usage:
 *   <table>
 *     <thead><tr>
 *       <th>Name</th>
 *       <th data-sort>Role</th>   <!-- sortable -->
 *     </tr></thead>
 *     <tbody>...</tbody>
 *   </table>
 *
 * Cycles: unsorted → asc → desc
 */

export function initTableSort(root = document) {
  root.querySelectorAll('th[data-sort]').forEach(th => {
    if (th._kernInit) return;
    th._kernInit = true;

    th.style.cursor = 'pointer';
    th.setAttribute('role', 'columnheader');
    th.setAttribute('aria-sort', 'none');

    th.addEventListener('click', () => {
      const table = th.closest('table');
      const tbody = table?.querySelector('tbody');
      if (!tbody) return;

      const colIndex = [...th.parentElement.children].indexOf(th);
      const current  = th.getAttribute('data-sort');
      const asc      = current !== 'asc';

      // Reset all other sortable headers
      table.querySelectorAll('th[data-sort]').forEach(h => {
        h.setAttribute('data-sort', '');
        h.setAttribute('aria-sort', 'none');
      });

      th.setAttribute('data-sort', asc ? 'asc' : 'desc');
      th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');

      const rows = [...tbody.querySelectorAll('tr')];

      rows.sort((a, b) => {
        const av = a.cells[colIndex]?.textContent.trim() ?? '';
        const bv = b.cells[colIndex]?.textContent.trim() ?? '';

        // Try numeric sort first
        const an = parseFloat(av.replace(/[^0-9.-]/g, ''));
        const bn = parseFloat(bv.replace(/[^0-9.-]/g, ''));

        if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });

      rows.forEach(row => tbody.appendChild(row));
    });
  });
}
