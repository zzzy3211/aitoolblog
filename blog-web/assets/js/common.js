// blog-web/assets/js/common.js
const commonLinkMap = {
  home: 'index.html',
  about: 'about.html',
  article: 'article/detail.html',
  admin: 'admin/article-edit.html',
  login: 'user/login.html',
  register: 'user/register.html',
  profile: 'user/profile.html',
};

function getSavedUser() {
  return localStorage.getItem('blogWebUser');
}

function setSavedUser(name) {
  if (name) {
    localStorage.setItem('blogWebUser', name);
  }
}

function clearSavedUser() {
  localStorage.removeItem('blogWebUser');
}

function updateAuthUI(basePath) {
  const user = getSavedUser();
  const authLinks = document.querySelector('.auth-links');
  const authUser = document.querySelector('.auth-user');
  const userChip = document.querySelector('.user-chip');
  const logoutBtn = document.getElementById('logout-btn');
  if (!authLinks || !authUser || !userChip || !logoutBtn) return;

  if (user) {
    authLinks.classList.add('hide');
    authUser.classList.remove('hide');
    userChip.textContent = `欢迎，${user}`;
    const profileLink = authUser.querySelector('[data-link="profile"]');
    if (profileLink) {
      profileLink.href = resolveCommonHref('profile', basePath);
    }
    logoutBtn.onclick = () => {
      clearSavedUser();
      window.location.href = resolveCommonHref('home', basePath);
    };
  } else {
    authLinks.classList.remove('hide');
    authUser.classList.add('hide');
    logoutBtn.onclick = null;
  }
}

function resolveCommonHref(key, basePath) {
  if (!commonLinkMap[key]) return '#';
  const normalizedBase = basePath?.replace(/\\/g, '/') || '';
  return `${normalizedBase}${commonLinkMap[key]}`;
}

async function loadCommonLayout(commonPath, activePage, basePath) {
  try {
    const response = await fetch(commonPath);
    if (!response.ok) throw new Error('无法加载公共布局');
    const html = await response.text();
    const headerHtml = html.match(/<!-- header-start -->([\s\S]*?)<!-- header-end -->/);
    const footerHtml = html.match(/<!-- footer-start -->([\s\S]*?)<!-- footer-end -->/);
    if (headerHtml) {
      const header = document.getElementById('common-header');
      if (header) header.innerHTML = headerHtml[1];
    }
    if (footerHtml) {
      const footer = document.getElementById('common-footer');
      if (footer) footer.innerHTML = footerHtml[1];
    }
    document.querySelectorAll('[data-link]').forEach((link) => {
      const page = link.dataset.link;
      link.href = resolveCommonHref(page, basePath);
      if (page === activePage) link.classList.add('active-link');
    });
    updateAuthUI(basePath);
  } catch (error) {
    console.warn('公共布局加载失败：', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const script = document.querySelector(
  'script[src*="common.js"]'
);
  const commonPath = script?.dataset?.commonPath || 'common/header-footer.html';
  const activePage = script?.dataset?.activePage || '';
  const basePath = script?.dataset?.basePath || '';
  loadCommonLayout(commonPath, activePage, basePath);
});
