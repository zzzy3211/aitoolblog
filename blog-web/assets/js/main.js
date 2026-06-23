// blog-web/assets/js/main.js
const navLinks = document.querySelectorAll('.site-nav a');
const activePage = window.location.pathname;
navLinks.forEach((link) => {
  if (link.getAttribute('href') === activePage) {
    link.classList.add('active-link');
  }
});

function togglePasswordVisibility(buttonId, inputId) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!button || !input) return;
  button.addEventListener('click', () => {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.textContent = type === 'password' ? '显示' : '隐藏';
  });
}

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

const savedUser = getSavedUser();

document.addEventListener('DOMContentLoaded', () => {
  if (savedUser && (window.location.pathname.endsWith('/user/login.html') || window.location.pathname.endsWith('/user/register.html'))) {
    window.location.href = '../index.html';
  }
  togglePasswordVisibility('toggle-login-password', 'login-password');
  togglePasswordVisibility('toggle-register-password', 'register-password');
  togglePasswordVisibility('toggle-register-confirm', 'register-confirm-password');
});

function showToast(message) {
  let toast = document.querySelector('.toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2200);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function validateForm(form) {
  const inputs = [...form.querySelectorAll('input[required]')];
  for (const input of inputs) {
    if (!input.value.trim()) {
      showToast(`${input.getAttribute('data-label') || '请输入完整信息'}`);
      input.focus();
      return false;
    }
  }
  return true;
}

function attachSubmit(formId, callback) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;
    callback(form);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  attachSubmit('login-form', (form) => {
    const account = form.querySelector('#login-account')?.value.trim() || '用户';
    setSavedUser(account);
    showToast('登录成功，正在跳转首页...');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 800);
  });

  const profileName = document.getElementById('profile-username');
  const profileDisplay = document.getElementById('profile-displayname');
  if (savedUser) {
    if (profileName) profileName.textContent = savedUser;
    if (profileDisplay) profileDisplay.textContent = savedUser;
  }

  attachSubmit('register-form', () => {
    showToast('注册成功，正在跳转登录页...');
    setTimeout(() => {
      window.location.href = '../user/login.html';
    }, 900);
  });

  attachSubmit('article-form', () => {
    showToast('文章已保存，已发布到草稿');
  });

  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateForm(commentForm)) return;

      const commentContent = commentForm.querySelector('#comment-content');
      if (commentContent && commentContent.value.trim()) {
        const commentContainer = commentForm.closest('.card');
        if (commentContainer) {
          const newComment = document.createElement('div');
          newComment.className = 'comment-card';
          newComment.innerHTML = `<p><strong>游客：</strong>${escapeHtml(commentContent.value.trim())}</p>`;
          commentContainer.insertBefore(newComment, commentForm);
        }
        showToast('评论发布成功');
        commentForm.reset();
      }
    });
  }

  const carousel = document.querySelector('.homepage-carousel');
  if (carousel) {
    initCarousel(carousel);
  }
});

function initCarousel(container) {
  const track = container.querySelector('.carousel-track');
  const slides = Array.from(container.querySelectorAll('.carousel-slide'));
  const dotsContainer = container.querySelector('.carousel-dots');
  const prevButton = container.querySelector('.carousel-btn.prev');
  const nextButton = container.querySelector('.carousel-btn.next');
  let currentIndex = 0;
  let timer = null;

  function update() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dotsContainer.querySelectorAll('button').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === 0 ? 'active' : '';
    dot.addEventListener('click', () => {
      currentIndex = index;
      update();
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    update();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    update();
  }

  nextButton?.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });
  prevButton?.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  const autoplay = container.dataset.autoplay === 'true';
  const interval = Number(container.dataset.interval) || 4200;

  function resetAutoPlay() {
    if (!autoplay) return;
    clearInterval(timer);
    timer = setInterval(nextSlide, interval);
  }

  if (autoplay) {
    timer = setInterval(nextSlide, interval);
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', resetAutoPlay);
  }
}
