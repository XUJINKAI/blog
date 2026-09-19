(() => {
  const list = document.querySelector(".project-list");
  if (!list) return;

  const cards = [...list.querySelectorAll(".project-card")];
  const media = window.matchMedia("(max-width: 760px)");
  function getGap(name, fallback) {
    const value = getComputedStyle(list).getPropertyValue(name);
    return Number.parseFloat(value) || fallback;
  }
  let frame = 0;
  let layingOut = false;

  function scheduleLayout() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(layout);
  }

  function resetMobile() {
    list.classList.remove("is-masonry");
    list.style.height = "";
    for (const card of cards) {
      card.style.left = "";
      card.style.top = "";
      card.style.width = "";
    }
  }

  function layout() {
    if (layingOut) return;
    if (media.matches) {
      resetMobile();
      return;
    }

    const width = list.clientWidth;
    if (!width) return;

    layingOut = true;
    list.classList.add("is-masonry");

    const columnGap = getGap("--project-column-gap", 14);
    const rowGap = getGap("--project-row-gap", 24);
    const columnWidth = (width - columnGap) / 2;
    const heights = [0, 0];

    for (const card of cards) {
      if (card.dataset.projectWidth === "full") {
        const top = Math.max(...heights);
        card.style.width = `${width}px`;
        card.style.left = "0px";
        card.style.top = `${top}px`;

        const bottom = top + card.offsetHeight + rowGap;
        heights[0] = bottom;
        heights[1] = bottom;
        continue;
      }

      card.style.width = `${columnWidth}px`;
      const column = heights[0] <= heights[1] ? 0 : 1;
      card.style.left = `${column * (columnWidth + columnGap)}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += card.offsetHeight + rowGap;
    }

    list.style.height = `${Math.max(0, Math.max(...heights) - rowGap)}px`;
    layingOut = false;
  }

  const observer = new ResizeObserver(() => {
    if (!layingOut) scheduleLayout();
  });

  for (const card of cards) observer.observe(card);

  for (const image of list.querySelectorAll("img")) {
    if (!image.complete) image.addEventListener("load", scheduleLayout, { once: true });
  }

  media.addEventListener("change", scheduleLayout);
  window.addEventListener("resize", scheduleLayout);
  scheduleLayout();
})();
