document.addEventListener("DOMContentLoaded", function () {
  initializePage();
  initializeSortSelect();
});

function initializePage() {
  initializeActiveCategory();
}

function initializeActiveCategory() {
  const currentCategory = new URLSearchParams(window.location.search).get("category");
  const currentCategoryLink = document.getElementById(`category_${currentCategory}`);
  if (currentCategoryLink) {
    currentCategoryLink.classList.add("active");
  } else {
    const allCategoryLink = document.getElementById("allCategory");
    if (allCategoryLink) {
      allCategoryLink.classList.add("active");
    }
  }
}

function initializeSortSelect() {
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function (event) {
      const selectedOption = event.target.value;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("sort", selectedOption);
      window.location.href = currentUrl.toString();
    });
  }
}
