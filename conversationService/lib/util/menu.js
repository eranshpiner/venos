const NO_IMAGE = 'https://afs.googleusercontent.com/gumtree-com/noimage_thumbnail_120x92_v2.png';

function getCategories({menu}, page = 1, perPage = 7) {
  -- page;
  return menu.items.slice(page * perPage, (page + 1) * perPage);
}

function getCategory({menu}, categoryId = -1) {
  return menu.items.find(category => category.id.toString() === categoryId.toString());
}

function findCategory({menu}, categoryName = '') {
  return menu.items.find(category => category.name === categoryName);
}

function getCategoriesReplies({customer, provider, pageNumber = 1}) {
  const perPage = provider.repliesPerPage();
  const totalCategories = customer.menu.items.length;
  const totalPages = Math.ceil(totalCategories / perPage);
  if (pageNumber > totalPages) {
    pageNumber = 1;
  }
  const categories = getCategories(customer, pageNumber, perPage)
    .map(category => ({key: category.name, value: `action?chooseCategory?${category.id}`}));
  categories.unshift({key: '🛒', value: 'action?cart'});
  if (totalPages > 1) {
    categories.unshift({key: 'עוד', value: `action?moreCategories?${pageNumber + 1}`});
  }
  return categories;
}


function getTotalItems(customer, categoryId) {
  const category = getCategory(customer, categoryId);
  return category && category.items.length || 0;
}

function getItems(customer, categoryId = -1, page = 1, perPage = 9) {
  const category = getCategory(customer, categoryId);
  --page;
  return category && category.items.slice(page * perPage, (page + 1) * perPage);
}

function getItem(customer, categoryId = -1, itemId = -1) {
  const category = getCategory(customer, categoryId);
  return category && category.items.find(item => item.id.toString() === itemId.toString());
}

function findItem(customer, categoryId = -1, itemStr = '') {
  const category = getCategory(customer, categoryId);
  return category.items.find(item => item.name === itemStr);
}

function hasCustomizations(item = {}) {
  return item.CategoriesAdd && item.CategoriesAdd.length > 0;
}

function getCustomizationsCategory(customer, categoryId = -1, itemId = -1, customizationCatId = -1) {
  const item = getItem(customer, categoryId, itemId);
  return item && item.CategoriesAdd.find(cat => cat.id.toString() === customizationCatId.toString());
}

function getCustomizationsItem(customer, categoryId = -1, itemId = -1, customizationCatId = -1, customizationItemId = -1) {
  const customizationCategory = getCustomizationsCategory(customer, categoryId, itemId, customizationCatId);
  return customizationCategory && customizationCategory.itemsAdd.find(item => item.id.toString() === customizationItemId.toString())
}

module.exports = {
  getCategories,
  getCategory,
  findCategory,
  getCategoriesReplies,

  getTotalItems,
  getItems,
  getItem,
  findItem,

  hasCustomizations,
  getCustomizationsCategory,
  getCustomizationsItem,

  NO_IMAGE,
};
