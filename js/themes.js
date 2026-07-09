function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.theme === theme);
  });
  VX.setTheme(theme);
  // re-render chart colors if budget view has been built
  if (window.renderBudgetChart && document.getElementById('view-budget').classList.contains('active')) {
    renderBudgetChart();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = VX.getTheme();
  setTheme(saved);
});
